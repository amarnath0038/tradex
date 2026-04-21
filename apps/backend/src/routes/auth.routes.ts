import { Router } from "express";
import { requestLink, verify } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { requestLinkSchema, verifySchema } from "../schemas/auth.schema";

const router: Router = Router();

router.post("/request-link", validate(requestLinkSchema), requestLink);
router.post("/verify", validate(verifySchema), verify);

export const authRoutes =  router;