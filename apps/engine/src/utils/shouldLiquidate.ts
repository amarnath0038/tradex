export const shouldLiquidate = (trade: any, currentPrice: number) => {
  const entry = Number(trade.entryPrice);
  const leverage = Number(trade.leverage);

  if (trade.side === "long") {
    const liqPrice = entry * (1 - 1 / leverage);
    return currentPrice <= liqPrice;
  } else {
    const liqPrice = entry * (1 + 1 / leverage);
    return currentPrice >= liqPrice;
  }
};