import { db, trades, users } from "@repo/db";
import { eq } from "@repo/db";
import { getPrice } from "../store/priceStore";
import { isValidAsset } from "../utils/isValidAsset";
import { computeTradeOutcome } from "../utils/computeTradeOutcome";
import { pub, REDIS_KEYS, sendErrorResponse, sendSuccessResponse, sendTradeResponse } from "@repo/redis";
import { creditUserBalance, getOpenTrade, removeOpenTrade } from "../store/tradingState";
import { calculatePnl } from "../utils/calculatePnl";

export const closeTrade = async (data: any) => {
  const { userId, tradeId } = data;

  // const trade = await db.query.trades.findFirst({
  //   where: (t, { eq }) => eq(t.id, tradeId)
  // });

  const trade = getOpenTrade(tradeId);

  if (!trade) {
    await sendErrorResponse({
      requestId: data.requestId,
      type: "CLOSE_TRADE",
      message: "trade not found"
    })
    return;
  }

if (trade.userId !== userId) {
  await sendErrorResponse({
    requestId: data.requestId,
    type: "CLOSE_TRADE",
    message: "unauthorized trade access"
  });
  return;
}

if (trade.status !== "OPEN") {
  await sendErrorResponse({
    requestId: data.requestId,
    type: "CLOSE_TRADE",
    message: "trade already closed"
  });
  return;
}

if (!isValidAsset(trade.asset)) {
  await sendErrorResponse({
    requestId: data.requestId,
      type: "CLOSE_TRADE",
    message: "invalid asset"
  });
  return;
}

  const marginUsed = Number(trade.marginUsed);
  const exitPrice = getPrice(trade.asset);
  //const { rawPnl, liquidated, finalPnl, pnlFixed} = computeTradeOutcome(trade, exitPrice)
  //const status = liquidated ? "LIQUIDATED" : "CLOSED";

  // console.log({
  //   rawPnl,
  //   marginUsed,
  //   finalPnl,
  //   pnlFixed,
  //   liquidated
  // });

  const pnl = calculatePnl(trade, exitPrice);

  const amountToReturn = pnl + marginUsed;

  const creditResult = creditUserBalance(userId, amountToReturn);

  if (!creditResult.success) {
    await sendErrorResponse({
      requestId: data.requestId,
      type: "CLOSE_TRADE",
      message: creditResult.error,
    });
    return;
  }

  removeOpenTrade(tradeId);


  // const user = await db.query.users.findFirst({
  //   where: (u, { eq }) => eq(u.id, userId)
  // });

  // if (!user) {
  //   console.log("user not found");

  //   await sendErrorResponse({
  //     requestId: data.requestId,
  //     type: "CLOSE_TRADE",
  //     message: "user not found"
  //   })
  //   return;
  // }

  // const newBalance = Number(Number(user.balance) + marginUsed + pnlFixed).toFixed(2);

  try {
    await db.transaction(async (tx) => {
    await tx.update(users)
      .set({ balance: creditResult.balance.toString() })
      .where(eq(users.id, userId));

    await tx.update(trades)
      .set({
        status: "CLOSED",
        exitPrice: exitPrice.toString()
      })
      .where(eq(trades.id, tradeId));
    });

    await sendSuccessResponse({
      requestId: data.requestId,
      type: "CLOSE_TRADE",
      message: "Trade closed",
      data: {
        tradeId,
        exitPrice,
        pnl,
        balance: creditResult.balance,
      }
    })
  } catch(err) {
    await sendErrorResponse({
      requestId: data.requestId,
      type: "CLOSE_TRADE",
      message: "database error"
    });
    return;
  }
}