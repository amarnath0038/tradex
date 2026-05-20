import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { whoami, wsToken } from "../controllers/user.controller";

const router: Router = Router();

router.get("/whoami", authMiddleware, whoami);
router.get("/ws-token", authMiddleware, wsToken);


export const userRoutes =  router;