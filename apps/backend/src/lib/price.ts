const prices: Record<string, number> = { BTC: 70000, ETH: 3500, SOL: 150 };

export const getPrice = (asset: string) => {
  const base = prices[asset] || 100;
  
  // random fluctuation 
  const change = base * (Math.random() * 0.04 - 0.02);
  return base + change;
};