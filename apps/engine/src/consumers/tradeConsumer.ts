import { REDIS_KEYS, stream } from "@repo/redis"
import { handleTradeEvent } from "../handlers/tradeHandler";
import { XReadResponse } from "@repo/types"

export const startTradeConsumer = async () => {
    let lastId = "$";
    while(true) {
        try {
            const response = await stream.xread(
                'BLOCK',
                 0,
                'STREAMS',
                REDIS_KEYS.TRADES_STREAM,
                lastId
            ) as XReadResponse ;

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
                    await handleTradeEvent(event);
                    lastId = id;
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