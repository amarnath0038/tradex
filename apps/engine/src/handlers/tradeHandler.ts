import { closeTrade } from "./closeTrade";
import { openTrade } from "./openTrade"

export const handleTradeEvent = async (event: any) => {
    switch (event.type) {
        case "OPEN_TRADE":
            console.log("Engine received trade event", event);

            return await openTrade(event);
            //break

        case "CLOSE_TRADE":
            return await closeTrade(event);
            //break;

        default:
            console.log("Unkown trade event");
    }
}