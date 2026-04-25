export function computeTradeOutcome(trade: any, price: number) {
  const entryPrice = Number(trade.entryPrice);
  const positionSize = Number(trade.positionSize);
  const leverage = Number(trade.leverage);
  const marginUsed = Number(trade.marginUsed);

  const rawPnl = (trade.side === "long") ? (price - entryPrice) * positionSize * leverage : (entryPrice - price) * positionSize * leverage;

  const loss = rawPnl < 0 ? -rawPnl : 0;

  const liquidated = loss >= marginUsed;

  const finalPnl = liquidated ? -marginUsed : rawPnl;

  const pnlFixed = Number(finalPnl.toFixed(2));

  return {
    rawPnl,
    loss,
    liquidated,
    finalPnl,
    pnlFixed
  };
}