import { db, eq, users, trades } from "@repo/db";
import { REDIS_KEYS, redisCommand, tradeEventReader } from "@repo/redis";
import { XReadResponse } from "@repo/types";

const GROUP = "trade:events:persister";
const CONSUMER = `perister-${process.pid}`;

const parseStreamFields = (fields: string[]) => {
    const result: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
        const key = fields[i];
        const value = fields[i + 1];

        if (key !== undefined && value !== undefined) {
            result[key] = value;
        }
    }
    return result;
}

export const  initTradeEventsPersisterGroup = async () => {
    try {
        redisCommand.xgroup(
            "CREATE",
            REDIS_KEYS.TRADE_EVENTS_STREAM,
            GROUP,
            "0",
            "MKSTREAM"
        )
        console.log("Trade events persister group created");
    } catch (err: any) {
         const message = [
            err?.message,
            err?.command?.name,
            JSON.stringify(err?.command ?? {}),
            String(err),
            ].join(" ");

        if (message.includes("BUSYGROUP")) {
            console.log("Trade events persister group already exists");
            return;
        }
    }
}


export const startTradeEventsPersister = async () => {
    while (true) {
        const result = await tradeEventReader.call(
            "XREADGROUP",
            "GROUP", GROUP, CONSUMER,
            "BLOCK", 5000,
            "COUNT", 10,
            "STREAMS", REDIS_KEYS.TRADE_EVENTS_STREAM, ">"
        ) as XReadResponse;

        if (!result) continue;

        for (const [, messages] of result) {
            for (const [messageId, fields] of messages) {
                const parsed = parseStreamFields(fields);
                if (!parsed.payload) {
                    console.error("Missing payload in stream message", parsed);
                    continue;
                }
                const event = JSON.parse(parsed.payload);

                console.log("Persisting trade event", event.type, event.requestId, messageId);

                try {
                    if (event.type === "TRADE_OPENED") {
                        await db.transaction(async (tx) => {
                            await tx.update(users)
                                .set({balance: event.balanceAfter.toString()})
                                .where(eq(users.id, event.userId));

                            await tx.insert(trades).values({
                                id: event.tradeId,
                                userId: event.userId,
                                asset: event.asset,
                                side: event.side,
                                leverage: event.leverage.toString(),
                                positionSize: event.positionSize.toString(),
                                marginUsed: event.marginUsed.toString(),
                                entryPrice: event.entryPrice.toString(),
                                status: "OPEN",
                            })
                        })
                    }

                    if (event.type === "TRADE_CLOSED") {
                        await db.transaction(async (tx) => {
                            await tx.update(users)
                                .set({balance: event.balance.toString()})
                                .where(eq(users.id, event.userId));

                            await tx.update(trades)
                                .set({
                                    status: "CLOSED",
                                    exitPrice: event.exitPrice.toString(),
                                })
                                .where(eq(trades.id, event.tradeId))
                        })
                    }   
                    await redisCommand.xack(REDIS_KEYS.TRADE_EVENTS_STREAM, GROUP, messageId);
                } catch (err) {
                    console.error("Error occurred while persisting trade event", err);
                }
            }
        }
    }
}