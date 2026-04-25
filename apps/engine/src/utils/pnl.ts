export const calculatePnl = (trade: any, price: number) {
    const entryPrice = Number(trade.entryPrice);
    const leverage = Number(trade.leverage);
    const positionSize = Number(trade.positionSize);

    if (trade.side === "long") {
        return (price - entryPrice) * positionSize * leverage;
    } else {
        return (entryPrice - price) * positionSize * leverage;
    }
}