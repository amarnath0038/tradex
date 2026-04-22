import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { whoami, logout } from "../controllers/user.controller";

const router: Router = Router();

router.get("/whoami", authMiddleware, whoami);
router.post("/logout", authMiddleware, logout);

export const userRoutes =  router;