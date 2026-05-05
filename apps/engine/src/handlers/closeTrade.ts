import { getPrice } from "../store/priceStore";
import { isValidAsset } from "../utils/isValidAsset";
import { sendErrorResponse, sendSuccessResponse} from "@repo/redis";
import { addOpenTrade, creditUserBalance, getOpenTrade, removeOpenTrade, restoreUserBalance } from "../store/tradingState";
import { calculatePnl } from "../utils/calculatePnl";
import { appendTradeEvent } from "../services/tradeJournal";

export const closeTrade = async (data: any) => {

  const startedAt = Date.now();

  const { userId, tradeId } = data;

  if (!userId || !tradeId) {
    await sendErrorResponse({
      requestId: data.requestId,
      type: "CLOSE_TRADE",
      message: "missing required fields"
    })
  }

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
  
  if (!exitPrice) {
    await sendErrorResponse({
      requestId: data.requestId,
      type: "CLOSE_TRADE",
      message: "price not available"
    })
  }

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

  
  const closedAt = new Date().toISOString();

  try {
    await appendTradeEvent({
      type: "TRADE_CLOSED",
      requestId: data.requestId,
      tradeId,
      userId,
      asset: trade.asset,
      side: trade.side,
      entryPrice: trade.entryPrice,
      exitPrice,
      positionSize: trade.positionSize,
      marginUsed,
      pnl,
      balanceAfter: creditResult.balance,
      closedAt
    })

    removeOpenTrade(tradeId);

    await sendSuccessResponse({
      requestId: data.requestId,
      type: "CLOSE_TRADE",
      message: "Trade closed",
      data: {
        tradeId,
        exitPrice,
        pnl,
        returnedAmount: amountToReturn,
        balance: creditResult.balance
      }
    })
  } catch (err) {
    restoreUserBalance(userId, creditResult.previousBalance);
    addOpenTrade(trade);

    await sendErrorResponse({
      requestId: data.requestId,
      type: "CLOSE_TRADE",
      message: "Failed to journal trade close"
    })
  }

  console.log("CloseTrade total took", ((Date.now() - startedAt) / 1000).toFixed(2), "s");
}