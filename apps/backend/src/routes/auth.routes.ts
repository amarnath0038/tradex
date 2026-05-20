import { Router } from "express";
import { logout, requestLink, verify } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { requestLinkSchema, verifySchema } from "../schemas/auth.schema";
import { authMiddleware } from "../middlewares/auth";

const router: Router = Router();

router.post("/request-link", validate(requestLinkSchema), requestLink);
router.post("/verify", validate(verifySchema), verify);
router.post("/logout", authMiddleware, logout);

export const authRoutes =  router;