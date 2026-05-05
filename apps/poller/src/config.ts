export const ASSETS = ["BTC", "ETH", "SOL"] as const;

export type Asset = (typeof ASSETS)[number];

export const SYMBOL_TO_ASSET: Record<string, Asset> = {
    BTCUSDT: "BTC",
    ETHUSDT: "ETH",
    SOLUSDT: "SOL"
}

export type PriceUpdate = {
  asset: Asset;
  price: number;
  timestamp: number; //binance event time
  receivedAt?: number; //poller receive time
  source: "BINANCE_WS";
};

export type BinanceMiniTickerMessage = {
  stream: string;
  data?: {
    s?: string;
    c?: string;
    E?: number;
  };
};


export const BINANCE_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"] as const;

export const BINANCE_WS_URL = process.env.BINANCE_WS_URL ?? "wss://stream.binance.com:9443/stream?streams=btcusdt@miniTicker/ethusdt@miniTicker/solusdt@miniTicker";


export const RECONNECT_BASE_DELAY = Number(process.env.RECONNECT_BASE_DELAY) || 1000;
export const RECONNECT_MAX_DELAY = Number(process.env.RECONNECT_MAX_DELAY) || 30000;
export const STALE_CONNECTION_THRESHOLD = Number(process.env.STALE_CONNECTION_THRESHOLD_MS) || 30000;



