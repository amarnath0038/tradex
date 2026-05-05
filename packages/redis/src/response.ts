import { pub } from "./client.js";
import { REDIS_KEYS } from "./keys.js";

export const sendTradeResponse = async (data: {
    requestId: string;
    status: "SUCCESS" | "ERROR";
    type?: string;
    message?: string;
    [key: string]: any;
}) => {
    return pub.publish(
        REDIS_KEYS.TRADE_RESPONSES,
        JSON.stringify(data)
    )
}

export const sendSuccessResponse = (data: any) => {
    return sendTradeResponse({...data, status: "SUCCESS"})
}

export const sendErrorResponse = (data: any) => {
    return sendTradeResponse({...data, status: "ERROR"})
}

export const publishUserStateUpdate = async (data: {
    userId: string;
    type: string;
    [key: string]: any;
}) => {
    return pub.publish(
        REDIS_KEYS.USER_STATE_UPDATES,
        JSON.stringify(data)
    )
}


