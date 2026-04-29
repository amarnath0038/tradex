import { REDIS_KEYS, state } from "@repo/redis";

export const ASSETS = ["BTC", "ETH", "SOL"] as const;
export type Asset = typeof ASSETS[number];

const prices: Record<Asset, number> = {
  BTC: 0,
  ETH: 0,
  SOL: 0
};

let isReady = false;

export const updatePrices = (asset: Asset, price: number) => {
  prices[asset] = price;
  
  state.set(REDIS_KEYS.MARKET_LAST_UPADATE, Date.now(), 'EX', 5); // expires in 5 secs if no updates come

  if (!isReady) {
    console.log("Market is Live");
    isReady = true;
  }
};

export const getPrice = (asset: Asset) => {
  const price =  prices[asset];
  if(!price || price === 0) {
    throw new Error(`Price not initialized for ${asset}`)
  }
  return price;
};
