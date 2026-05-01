export type  RedisStreamMessage = [id: string, fields: string[]];

export type RedisStream = [stream: string, messages: RedisStreamMessage[]];

export type XReadResponse = RedisStream[] | null;

export type TradeResponse = {
    requestId: string;
    status: "SUCCESS" | "ERROR";
    type?: string;
    message?: string;
    pnl?: number;
    tradeStatus?: "OPEN" | "CLOSED" | "LIQUIDATED";
}