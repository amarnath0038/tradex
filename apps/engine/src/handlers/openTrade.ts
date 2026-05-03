import { db, users, trades } from "@repo/db";
import { eq, } from "@repo/db";
import crypto from "crypto";
import { getPrice } from "../store/priceStore";
import { sendErrorResponse, sendSuccessResponse } from "@repo/redis";
import { addOpenTrade, debitUserBalance, removeOpenTrade, restoreUserBalance } from "../store/tradingState";
import { appendTradeEvent } from "../services/tradeJournal";

export const openTrade = async (data:any) => {
  const startedAt = Date.now();

  const {userId, asset, side, leverage, positionSize} = data;
 
  const lev = Number(leverage);
  const size = Number(positionSize)
  const requiredMargin = size / lev;
  const entryPrice = getPrice(asset);

  if (!entryPrice) {
    await sendErrorResponse({
      requestId: data.requestId,
      type: "OPEN_TRADE",
      message: "price not available"
    });
    return;
  }


  const debitStart = Date.now();
  const debitResult = debitUserBalance(userId, requiredMargin);
  console.log("Memory debit took", ((Date.now() - debitStart) / 1000).toFixed(2), "s");

  if (!debitResult.success) {
    await sendErrorResponse({
      requestId: data.requestId,
      type: "OPEN_TRADE",
      message: debitResult.error,
    });
    return;
  }

  const tradeId = crypto.randomUUID();

  const openedAt = new Date();

  const createdAt = new Date().toISOString();

  const trade = {
    id: tradeId,
    userId,
    asset,
    side,
    leverage: lev,
    positionSize: size,
    marginUsed: requiredMargin,
    entryPrice,
    openedAt,
  };


  try {
    const journalStart = Date.now();
    await appendTradeEvent({
      type: "TRADE_OPENED",
      requestId: data.requestId,
      tradeId,
      userId,
      asset,
      side,
      leverage: lev,
      positionSize: size,
      marginUsed: requiredMargin,
      entryPrice,
      balanceAfter: debitResult.balance,
      createdAt,
    });

    console.log("Journal append took", ((Date.now() - journalStart) / 1000).toFixed(2), "s");

    const memoryStart = Date.now();
    addOpenTrade(trade);
    console.log("Memory add trade took", ((Date.now() - memoryStart) / 1000).toFixed(2), "s");

    const responseStart = Date.now();
    await sendSuccessResponse({
      requestId: data.requestId,
      type: "OPEN_TRADE",
      message: "Trade created",
      data: {
        tradeId,
        entryPrice,
        marginUsed: requiredMargin,
        balance: debitResult.balance,
      },
    });
    console.log("Send response took", ((Date.now() - responseStart) / 1000).toFixed(2), "s");
  } catch (err) {
    restoreUserBalance(userId, debitResult.previousBalance);
    removeOpenTrade(tradeId);

    await sendErrorResponse({
      requestId: data.requestId,
      type: "OPEN_TRADE",
      message: "failed to journal trade",
    });
  }

  console.log(
    "openTrade total took",
    ((Date.now() - startedAt) / 1000).toFixed(2),
    "s"
  );
};