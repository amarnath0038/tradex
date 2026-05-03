import { db, users, trades, eq, and } from "@repo/db";
import { addOpenTrade, getStateStats, setUserBalance } from "../store/tradingState";

export const loadTradingState =  async () => {
    console.log("Loading tradinig state");

    const startedAt = Date.now();
    const dbUsers = await db.select().from(users);

    for (const user of dbUsers) {
        setUserBalance(user.id, Number(user.balance));
    }

    const dbOpenTrades = await db.select().from(trades).where(and(eq(trades.status, "OPEN")));

    for (const trade of dbOpenTrades) {
    addOpenTrade({
      id: trade.id,
      userId: trade.userId,
      asset: trade.asset,
      side: trade.side as "long" | "short",
      leverage: Number(trade.leverage),
      positionSize: Number(trade.positionSize),
      marginUsed: Number(trade.marginUsed),
      entryPrice: Number(trade.entryPrice),
      openedAt: trade.createdAt ?? new Date(),
    });
  }


  console.log(
    "Trading state loaded",
    getStateStats(),
    `in ${((Date.now() - startedAt) / 1000).toFixed(2)}s`
  );
}