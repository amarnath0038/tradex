import { db, trades, users } from "@repo/db";
import { eq } from "@repo/db";
import { getPrice } from "../priceStore";
import { isValidAsset } from "../utils/isValidAsset";
import { computeTradeOutcome } from "../utils/calculateTradeOutcome";
import { pub } from "@repo/redis";

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

  if (!isValidAsset(trade.asset)) {
    console.log("Invalid asset", trade.asset);
    return;
  }

  const marginUsed = Number(trade.marginUsed);
  const exitPrice = getPrice(trade.asset);
  const { rawPnl, loss, liquidated, finalPnl, pnlFixed} = computeTradeOutcome(trade, exitPrice)
  const status = liquidated ? "LIQUIDATED" : "CLOSED";

  console.log({
    rawPnl,
    loss,
    marginUsed,
    finalPnl,
    pnlFixed,
    liquidated
  });


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
  

  await pub.publish("channel:prices", JSON.stringify({
    userId,
    tradeId,
    status,
    pnl: pnlFixed
  }))



  console.log("Trade closed", {
    tradeId,
    pnl: pnlFixed,
    status,
    reason: data.reason || "manual" // to see if its manually closed or liquidated
  });
};