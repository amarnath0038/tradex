import { REDIS_KEYS, redisCommand } from "@repo/redis"
import { handleTradeEvent } from "../handlers/tradeHandler";
import { XReadResponse } from "@repo/types"


export const initConsumerGroup = async () => {
    try {
        await redisCommand.xgroup(
            "CREATE",
            REDIS_KEYS.TRADES_STREAM,
            "trade-group",
            "0",
            "MKSTREAM"
        )
        console.log("Consumer group created");
    } catch (err: any) {
        if (err.message.includes("BUSYGROUP")) {
            console.log("Consumer group already exists");
        }
    }
}


export const startTradeConsumer = async () => {
    const consumerName = `consumer-${process.pid}`;
    while(true) {
        try {
            console.log("Engine waiting for trades on", REDIS_KEYS.TRADES_STREAM);


            const response = await redisCommand.call(
                "XREADGROUP",
                "GROUP", "trade-group", consumerName,
                "BLOCK", 5000, // wait upto 5 secs for new msgs
                "COUNT", 10,   // read max 10 msgs at once 
                "STREAMS", REDIS_KEYS.TRADES_STREAM,
                ">" // give new msgs not yet delivered
            ) as XReadResponse ;

            console.log("Engine xreadgroup result", JSON.stringify(response));

            if (!response || response.length === 0) continue;

            const [streamData] = response;
            if (!streamData) continue;

            const [, messages] = streamData;

            for (const [id, fields] of messages) {
                const data: Record<string, string> = {};

                for (let i =0; i< fields.length; i += 2) {
                    const key = fields[i];
                    const value = fields[i + 1];
                    if (key && value) {
                        data[key] = value;
                    }
                }

                try {
                    if (!data.payload) {
                        console.log("Missing payload");
                        continue;
                    }
                    const event = JSON.parse(data.payload);
                    console.log("Received trade event", event.type, event.requestId);
                    await handleTradeEvent(event);
                    

                    //ACK after successfull processing
                    await redisCommand.xack(
                        REDIS_KEYS.TRADES_STREAM,
                        "trade-group",
                        id
                    )

                } catch (err) {
                    console.log("Error processing event", err);
                }
            }
        } catch (err){
            console.log("Error consuming trades", err);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}