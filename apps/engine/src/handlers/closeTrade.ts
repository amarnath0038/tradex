import { db, trades, users } from "@repo/db";
import { eq } from "@repo/db";
import { getPrice } from "../priceStore";

export const handleCloseTrade = async (data: any) => {
  const { userId, tradeId } = data;

  const trade = await db.query.trades.findFirst({
    where: (t, { eq }) => eq(t.id, tradeId)
  });

  if (!trade) {
    console.log("trade not found");
    return;
  }

  if (trade.userId !== userId) {
    console.log("not your trade");
    return;
  }

  if (trade.status !== "OPEN") {
    console.log("trade already closed");
    return;
  }

  const entryPrice = Number(trade.entryPrice);
  const positionSize = Number(trade.positionSize);
  const leverage = Number(trade.leverage);
  const marginUsed = Number(trade.marginUsed);

  const allowedAssets = ["BTC", "ETH", "SOL"] as const;

  if (!allowedAssets.includes(trade.asset as any)) {
    console.log("invalid asset:", trade.asset);
    return;
  }

  const exitPrice = getPrice(trade.asset as typeof allowedAssets[number]);
    

  console.log({
    entryPrice,
    exitPrice,
    positionSize,
    leverage,
    marginUsed
  });
  

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
  const pnlFixed = Number(pnl.toFixed(2));

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId)
  });

  if (!user) {
    console.log("user not found");
    return;
  }

  const newBalance = Number(Number(user.balance) + marginUsed + pnlFixed).toFixed(2);

  try {
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
  } catch(err) {
    console.log("DB trabsaction error");
  }
  

  console.log("Trade closed", {
    tradeId,
    pnl: pnlFixed,
    status
  });
};