import { REDIS_KEYS, redisCommand } from "@repo/redis";
import { TradeEvent } from "@repo/types";
import { toStreamArgs } from "../utils/streamArgs";

export const appendTradeEvent = (event: TradeEvent) => {
    return  redisCommand.xadd(
        REDIS_KEYS.TRADE_EVENTS_STREAM,
        "*",
        ...toStreamArgs({
            payload: JSON.stringify(event)
        })
    )
}