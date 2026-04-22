import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { closeTrade, openTrade } from "../controllers/trade.controller";
import { closeTradeSchema, openTradeSchema } from "../schemas/trade.schema";

const router: Router = Router();

router.post("/open", authMiddleware, validate(openTradeSchema), openTrade);

router.post("/close", authMiddleware, validate(closeTradeSchema), closeTrade);

export const tradeRoutes =  router;