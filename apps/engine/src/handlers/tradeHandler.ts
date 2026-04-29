import { closeTrade } from "./closeTrade";
import { openTrade } from "./openTrade"

export const handleTradeEvent = async (event: any) => {
    switch (event.type) {
        case "OPEN_TRADE":
            await openTrade(event);
            break;

        case "CLOSE_TRADE":
            await closeTrade(event.tradeId);
            break;

        default:
            console.log("Unkown trade event");
    }
}