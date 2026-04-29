import { pub, REDIS_KEYS } from "@repo/redis";
import axios from "axios";

const ASSETS = ["BTC", "ETH", "SOL"];
const url = process.env.BINANCE_URL || "https://api.binance.com/api/v3/ticker/price";

const fetchPrices = async () => {
    try {
        const res = await axios.get(url);

        const data = res.data;
        const prices: Record<string, number> = {};

        for (const item of data) {
            if (item.symbol === "BTCUSDT") prices.BTC = Number(item.price); 
            if (item.symbol === "ETHUSDT") prices.ETH = Number(item.price); 
            if (item.symbol === "SOLUSDT") prices.SOL = Number(item.price); 
        }

        return prices;

    } catch (err) {
        console.log("Error fetching prices");
        return null;
    }
}

async function start() {
    console.log("Poller started");

    setInterval( async () => {
        const prices = await fetchPrices();
        if (!prices) return;

        for(const asset of ASSETS) {
            const price = prices[asset];
            if (!price) continue;

            await pub.publish(REDIS_KEYS.PRICE_CHANNEL, JSON.stringify({asset, price}))
            console.log(asset, price);
        }
    }, 2000)
}

start();