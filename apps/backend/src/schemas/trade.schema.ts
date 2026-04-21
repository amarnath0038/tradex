import { z } from "zod";

export const openTradeSchema = z.object({
  asset: z.enum(["BTC", "ETH", "SOL"]),
  side: z.enum(["long", "short"]),
  leverage: z.number().min(1).max(100),
  positionSize: z.number().positive()
});

export const closeTradeSchema = z.object({
    tradeId: z.string().uuid()
});