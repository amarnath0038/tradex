import { BInanceMarketDataStream } from "./marketData/binanceWs";

const marketData = new BInanceMarketDataStream();

const shutdown = (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully`);
    try {
        marketData.stop();
    } catch (err) {
        console.error("Error stopping market data service")
    }
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
 
marketData.start(); 
