import { Router } from "express";
import { auth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { openTrade } from "../controllers/trade.controller";
import { openTradeSchema } from "../schemas/trade.schema";

const router: Router = Router();

router.post("/open", auth, validate(openTradeSchema), openTrade);

export const tradeRoutes =  router;