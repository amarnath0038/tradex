export const calculatePnl = (trade: any, price: number) => {
    const entryPrice = Number(trade.entryPrice);
    const leverage = Number(trade.leverage);
    const positionSize = Number(trade.positionSize);

    const quantity = positionSize / entryPrice;
    if (trade.side === "long") {
        return (price - entryPrice) * quantity * leverage;
    } else {
        return (entryPrice - price) * quantity * leverage;
    }
}