import { pub, REDIS_KEYS } from "@repo/redis";
import { PriceUpdate } from "../../config";

export const publishPriceUPdate = async (update: PriceUpdate) => {
    return pub.publish(REDIS_KEYS.PRICE_CHANNEL, JSON.stringify(update));
}