import { Request, Response } from "express";
import  { stream } from "@repo/redis"
import { toStreamArgs } from "../utils/streamArgs";
import { isMarketReady } from "../utils/isMarketReady";

//open trade
export const openTrade = async (req: Request, res: Response) => {

  const ready = await isMarketReady();
  if (!ready) {
    return res.status(400).json({error:"Market not ready"})
  }
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "unauthorized" });
  }

  
  const { asset, side, leverage, positionSize } = req.body;

  if (!leverage || leverage <= 0) {
    return res.status(400).json({ error: "invalid leverage" });
  }

  //send to redis stream
  
  await stream.xadd("stream:app:info", "*", ...toStreamArgs({
      type: "OPEN_TRADE",
      userId,
      asset,
      side,
      leverage,
      positionSize
    })
  )
  return res.json({
    message: "message sent to engine",
  });
};


//close trade
export const closeTrade = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { tradeId } = req.body;

  await stream.xadd("stream:app:info", "*", ...toStreamArgs({
      type: "CLOSE_TRADE",
      userId,
      tradeId
    })
  );

  return res.json({
    message: "close trade request sent to engine"
  });
};