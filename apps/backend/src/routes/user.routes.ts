import { Router } from "express";
import { auth } from "../middlewares/auth";
import { whoami, logout } from "../controllers/user.controller";

const router: Router = Router();

router.get("/whoami", auth, whoami);
router.post("/logout", auth, logout);

export const userRoutes =  router;