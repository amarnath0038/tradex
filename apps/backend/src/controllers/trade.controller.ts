import { db, trades, users } from "@repo/db";
import { Request, Response } from "express";
import { eq } from "@repo/db";
import { getPrice } from "../lib/price";

export const openTrade = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const { asset, side, leverage, positionSize } = req.body;

  const user = await db.query.users.findFirst({
    where: (u,{eq}) => eq(u.id, userId)
  })

  if (!user) {
    return res.status(404).json({ error: "user not found"})
  }


  const requiredMargin = positionSize / leverage;

  if (Number(user.balance) < requiredMargin) {
    return res.status(400).json({ error: "Insufficient balance"})
  }

  //deduct balance
  const newBalance = Number(user.balance) - requiredMargin;

  await db.update(users)
    .set({ balance: newBalance.toString()})
    .where(eq(users.id, userId));



  const entryPrice = getPrice(asset);
  //create trade
  const trade = await db.insert(trades).values({
    userId,
    asset,
    side,
    leverage: leverage.toString(),
    positionSize: positionSize.toString(),
    marginUsed: requiredMargin.toString(),
    entryPrice: entryPrice.toString(),
    status: "OPEN"
  }).returning();

  res.json(trade);
};



export const closeTrade = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { tradeId } = req.body;

  const trade = await db.query.trades.findFirst({
    where: (t, {eq}) => eq(t.id, tradeId)
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

  let pnl = 0;

  if (trade.side === "long") {
    pnl = (exitPrice - entryPrice) * positionSize;
  } else {
    pnl = (entryPrice - exitPrice) * positionSize;
  }

  const marginUsed = Number(trade.marginUsed);

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId)
  });

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }

  const newBalance = Number(user.balance) + marginUsed + pnl;

  await db.update(users)
    .set({ balance: newBalance.toString() })
    .where(eq(users.id, userId));

  await db.update(trades)
    .set({ status: "CLOSED", exitPrice: exitPrice.toString() })
    .where(eq(trades.id, tradeId));

  return res.json({
    message: "trade closed",
    pnl,
    newBalance
  });
};