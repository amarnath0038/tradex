import crypto from "crypto";
import { Request, Response } from "express";
import  { REDIS_KEYS, stream } from "@repo/redis"
import { toStreamArgs } from "../utils/streamArgs";
import { isMarketReady } from "../utils/isMarketReady";
import { waitForResponse } from "../services/responseManager";

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

  if (!asset || !side || !positionSize) { 
    return res.status(400).json({ error: "missing required fields" }); 
  }

  if (!leverage || leverage <= 0) {
    return res.status(400).json({ error: "invalid leverage" });
  }

  
  const requestId = crypto.randomUUID();
  console.log("Sending trade event", requestId)

  //const responsePromise = await waitForResponse(requestId);
  //send to redis stream
  await stream.xadd(REDIS_KEYS.TRADES_STREAM, "*", ...toStreamArgs({
    payload: JSON.stringify({
      type: "OPEN_TRADE",
      requestId,
      userId,
      asset,
      side,
      leverage,
      positionSize
    })
    })
  )

  try {
    const result = await waitForResponse(requestId);
    return res.json(result);
  } catch (err) {
    console.log("Open trade  failed", err)
    return res.status(500).json({ error: "Failed to get response from engine" });
  }
 
};


//close trade
export const closeTrade = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { tradeId } = req.body;
  if (!tradeId) { 
    return res.status(400).json({ error: "tradeId required" }); 
  }

  const requestId = crypto.randomUUID();
  //const responsePromise = waitForResponse(requestId); 
  await stream.xadd(REDIS_KEYS.TRADES_STREAM, "*", ...toStreamArgs({
    payload: JSON.stringify({
      type: "CLOSE_TRADE",
      requestId,
      userId,
      tradeId
    })
    })
  );

  try {
    const result = await waitForResponse(requestId);
    return res.json({
      data: result,
      status: result.status === "SUCCESS"
    });
  } catch (err) {
    console.log("Close trade failed", err)
    return res.status(500).json({ error: "Failed to get response from engine" });
  }

};