import { db, trades, users } from "@repo/db";
import { Request, Response } from "express";
import { eq } from "@repo/db";
import { getPrice } from "../lib/price";
import  { redis } from "@repo/redis"
import { toStreamArgs } from "../utils/streamArgs";

//open trade
export const openTrade = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { asset, side, leverage, positionSize } = req.body;

  if (!leverage || leverage <= 0) {
    return res.status(400).json({ error: "invalid leverage" });
  }

  //send to redis stream
  
  await redis.xadd("stream:app:info", "*", ...toStreamArgs({
      type: "OPEN_TRADE",
      userId,
      asset,
      side,
      leverage,
      positionSize
    })
  )
  return res.json({
    message: "message sent to engine",
  });
};


//close trade
export const closeTrade = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const { tradeId } = req.body;
  const trade = await db.query.trades.findFirst({
    where: (t, { eq }) => eq(t.id, tradeId)
  });

  if (!trade) {
    return res.status(404).json({ error: "trade not found" });
  }

  if (trade.userId !== userId) {
    return res.status(403).json({ error: "not your trade" });
  }

  if (trade.status !== "OPEN") {
    return res.status(400).json({ error: "trade already closed" });
  }

  const entryPrice = Number(trade.entryPrice);
  const exitPrice = getPrice(trade.asset);
  const positionSize = Number(trade.positionSize);
  const leverage = Number(trade.leverage);
  const marginUsed = Number(trade.marginUsed);

  let pnl = 0;

  if (trade.side === "long") {
    pnl = (exitPrice - entryPrice) * positionSize * leverage;
  } else {
    pnl = (entryPrice - exitPrice) * positionSize * leverage;
  }

  let liquidated = false;
  if (-pnl >= marginUsed) {
    pnl = -marginUsed;
    liquidated = true;
  }

  const status = liquidated ? "LIQUIDATED" : "CLOSED";

  //rounding 
  const pnlFixed = Number(pnl.toFixed(2));

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId)
  });

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }

  const newBalance = Number(user.balance) + marginUsed + pnlFixed;

  await db.transaction(async (tx) => {
    await tx.update(users)
      .set({ balance: newBalance.toString() })
      .where(eq(users.id, userId));

    await tx.update(trades)
      .set({
        status,
        exitPrice: exitPrice.toString()
      })
      .where(eq(trades.id, tradeId));
  });

  return res.json({
    message: "trade closed",
    pnl: pnlFixed,
    exitPrice,
    status,
    newBalance
  });
};