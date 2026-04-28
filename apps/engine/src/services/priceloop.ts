import { db } from "@repo/db";
import { getPrice, updatePrices } from "../priceStore";
import { isValidAsset } from "../utils/isValidAsset";
import { shouldLiquidate } from "../utils/liquidation";
import { handleCloseTrade } from "../handlers/closeTrade";
import { pub } from "@repo/redis";

export const startPriceloop =  async () => {
    while (true) {
        updatePrices();
        const price = getPrice("BTC");

        console.log("BTC:", price);

        await pub.publish("channel:prices", JSON.stringify({
            asset: "BTC",
            price,
        }))

        const openTrades = await db.query.trades.findMany({
            where: (t, { eq }) => eq(t.status, "OPEN")
        });

        for (const trade of openTrades) {
            if (!isValidAsset(trade.asset)) {
                console.log("Invalid asset", trade.asset);
                continue;
            }
            const currentPrice = getPrice(trade.asset);

            if (shouldLiquidate(trade, currentPrice)) {
                console.log("Liquidating:", {
                    tradeId: trade.id,
                    asset: trade.asset,
                    currentPrice
                });

                await handleCloseTrade({
                    userId: trade.userId,
                    tradeId: trade.id,
                    reason: "liquidation"
                });
            }
        }
        await new Promise((res) => setTimeout(res, 2000)) // sleep
    }
}