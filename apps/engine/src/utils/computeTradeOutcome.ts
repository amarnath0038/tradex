import { shouldLiquidate } from "./shouldLiquidate";
import { calculatePnl } from "./calculatePnl";

export function computeTradeOutcome(trade: any, price: number) {
  const marginUsed = Number(trade.marginUsed);

  const rawPnl = calculatePnl(trade, price);

  const liquidated = shouldLiquidate(trade, price);

  const finalPnl = liquidated ? -marginUsed : rawPnl;

  return {
    rawPnl,
    liquidated,
    finalPnl,
    pnlFixed: Number(finalPnl.toFixed(2)),
  };
}