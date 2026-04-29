import { REDIS_KEYS, sub } from "@repo/redis"
import { ASSETS, updatePrices } from "../store/priceStore";
import { isValidAsset } from "../utils/isValidAsset";
import { processLiquidations } from "../handlers/liquidationHandler";

export const startPriceSubscriber = async () => {
    console.log("Starting price subdcriber");
    await sub.subscribe(REDIS_KEYS.PRICE_CHANNEL);

    sub.on("message", async (channel, message) => {
        if (channel !== REDIS_KEYS.PRICE_CHANNEL) return;

        try {
            const { asset, price } = JSON.parse(message);

            if (!isValidAsset(asset) || !price) return;
            // update in-memory store
            updatePrices(asset, price);

            console.log("Price updated:", asset, price);

            await processLiquidations(asset, price);
        } catch (err) {
            console.log("Error while updating price", err);
        }
    })
}