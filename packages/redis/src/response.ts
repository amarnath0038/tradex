import { pub } from "./client.js";
import { REDIS_KEYS } from "./keys.js";

export const sendTradeResponse = async (data: {
    requestId: string;
    status: "SUCCESS" | "ERROR";
    type?: string;
    message?: string;
    [key: string]: any;
}) => {
    await pub.publish(
        REDIS_KEYS.TRADE_RESPONSES,
        JSON.stringify(data)
    )
}

export const sendSuccessResponse = (data: any) => {
    sendTradeResponse({...data, status: "SUCCESS"})
}

export const sendErrorResponse = (data: any) => {
    sendTradeResponse({...data, status: "ERROR"})
}
