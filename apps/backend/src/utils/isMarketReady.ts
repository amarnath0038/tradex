import { REDIS_KEYS, state } from "@repo/redis"

export const isMarketReady = async (): Promise<Boolean> => {
    const lastUpdate = await state.get(REDIS_KEYS.MARKET_LAST_UPADATE);

    if (!lastUpdate) return false;

    const isFresh = Date.now() - Number(lastUpdate) < 5000; // checks if last update wass within 5 secs

    return isFresh;
}