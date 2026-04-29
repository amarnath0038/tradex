import { db } from "@repo/db";
import { shouldLiquidate } from "../utils/shouldLiquidate";
import { closeTrade } from "../handlers/closeTrade";
import { Asset } from "../store/priceStore";

export const processLiquidations = async (asset: Asset, price: number) => {
  try {
    
    const openTrades = await db.query.trades.findMany({
      where: (trade, {eq, and}) => and(eq(trade.status, "OPEN"), eq(trade.asset, asset))
    });

    if (!openTrades.length) return;

    for (const trade of openTrades) {
      try {
        if (!shouldLiquidate(trade, price)) continue;

        console.log("Liquidating trade:", {
          tradeId: trade.id,
          asset,
          price
        });

        await closeTrade({
          userId: trade.userId,
          tradeId: trade.id,
          reason: "liquidation"
        });

      } catch (err) {
        console.log("Failed to liquidate trade:", trade.id, err);
      }
    }

  } catch (err) {
    console.log("Error in processLiquidations:", err);
  }
};