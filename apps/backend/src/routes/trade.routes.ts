import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { closeTrade, getOpenTrades, getTradeHistory, openTrade } from "../controllers/trade.controller";
import { closeTradeSchema, openTradeSchema } from "../schemas/trade.schema";
import { asyncHandler } from "../utils/asyncHandler";

const router: Router = Router();

router.get("/open", authMiddleware, getOpenTrades);
router.get("/history", authMiddleware, getTradeHistory);

router.post("/open", authMiddleware, validate(openTradeSchema), asyncHandler(openTrade));
router.post("/close", authMiddleware, validate(closeTradeSchema), asyncHandler(closeTrade));

export const tradeRoutes =  router;