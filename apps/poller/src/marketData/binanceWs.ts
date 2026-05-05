import WebSocket from "ws";
import { BINANCE_WS_URL, BinanceMiniTickerMessage, RECONNECT_BASE_DELAY, RECONNECT_MAX_DELAY, STALE_CONNECTION_THRESHOLD, SYMBOL_TO_ASSET } from "../config";
import { publishPriceUPdate } from "../services/price/pricePublisher";


const parseJson = (raw: string) : BinanceMiniTickerMessage | null => {
    try {
        return JSON.parse(raw) as BinanceMiniTickerMessage;
    } catch {
        return null;
    }
}

export class  BInanceMarketDataStream {
    private ws: WebSocket | null = null;
    private stopped = false;
    private reconnectAttempts = 0;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private staleTimer: NodeJS.Timeout | null = null;
    private lastMessageAt = 0

    start() {
        this.stopped = false;
        this.connect();
    }

    stop() {
        this.stopped = true;
        this.clearReconnectTimer();
        this.clearStaleTimer();
        if (this.ws) {
            this.ws.removeAllListeners();
            this.ws.close();
            this.ws = null;
        }
    }


    private connect() {
        if (this.stopped) return;

        console.log("Connecting to BInance WS");

        this.ws = new WebSocket(BINANCE_WS_URL);

        this.ws.on("open", () => {
            this.reconnectAttempts = 0;
            this.lastMessageAt = Date.now();
            console.log("Connected to Binance WS");
            this.startStaleWatch();
        })

        this.ws.on("message", (raw: any) => {
            this.lastMessageAt = Date.now();

            this.handleMessage(raw.toString()).catch((err: any) => {
                console.error("Failed to parse Binance message", err);
            })
        });

        this.ws.on("close", () => {
            console.log("Binance WS closed");
            this.cleanupSocket();
            this.scheduleReconnect();
        })

        this.ws.on("error", (err: any) => {
            console.log("Binance WS error", err.message);
            this.ws?.close();
        })
    }

    private async handleMessage(raw:string) {
        const message = parseJson(raw);

        if (!message?.data) return;

        const symbol = message.data.s;
        const priceValue = message.data.c;

        if (!symbol || !priceValue) return;

        const asset = SYMBOL_TO_ASSET[symbol];

        if (!asset) return;

        const price = Number(priceValue);

        if (!Number.isFinite(price) || price <= 0) return;

        await publishPriceUPdate({
            price,
            asset,
            timestamp: message.data.E ?? Date.now(),
            source: "BINANCE_WS"
        });
    
        console.log("Price published", asset, price);

    }

    private startStaleWatch() {
        this.clearStaleTimer();

        this.staleTimer = setInterval(() => {
            const age = Date.now() - this.lastMessageAt;

            if (age < STALE_CONNECTION_THRESHOLD) return;

            console.warn(`Binance WS stale for ${age}ms, reconnecting`);
            this.ws?.terminate();
        }, STALE_CONNECTION_THRESHOLD);
    }

    private scheduleReconnect() {
        if (this.stopped || this.reconnectTimer) return;

        const delay = Math.min(RECONNECT_BASE_DELAY * 2 ** this.reconnectAttempts, RECONNECT_MAX_DELAY);

        this.reconnectAttempts += 1;

        console.log(`Reconnecting Binance WS in ${delay}ms`);

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, delay);
    }


    private cleanupSocket() {
        this.clearStaleTimer();

        if (!this.ws) return;

        this.ws.removeAllListeners();
        this.ws = null;
    }

    private clearReconnectTimer() {
        if (!this.reconnectTimer) return;

        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
    }

    private clearStaleTimer() {
        if (!this.staleTimer) return;

        clearInterval(this.staleTimer);
        this.staleTimer = null;
    }
}