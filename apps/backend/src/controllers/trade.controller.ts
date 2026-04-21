import { db, trades } from "@repo/db";
import { Request, Response } from "express";

export const openTrade = async (req: Request, res: Response) => {
  const userId = req.userId;
  
  if (!userId) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const { asset, side, leverage } = req.body;

  const trade = await db.insert(trades).values({
    userId,
    asset,
    side,
    leverage,
    entryPrice: "100", // jus a placeholder
    status: "OPEN"
  }).returning();

  res.json(trade);
};