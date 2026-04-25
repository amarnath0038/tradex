export const ASSETS = ["BTC", "ETH", "SOL"] as const;
export type Asset = typeof ASSETS[number];

const prices: Record<Asset, number> = {
  BTC: 70000,
  ETH: 3500,
  SOL: 150
};

export const getPrice = (asset: Asset) => {
  return prices[asset];
};

export const updatePrices = () => {
  (Object.keys(prices) as Asset[]).forEach((asset) => {
    const change = Math.random() * 0.02 - 0.01;
    prices[asset] *= (1 + change);
  });
};