import { calculatePnl } from "./pnl";

export const shouldLiquidate = (trade: any, currentPrice: number) => {
    const marginUsed = Number(trade.marginUsed);
    const pnl = calculatePnl(trade, currentPrice);
    return -pnl >= marginUsed;
}