import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;
  const token = req.cookies.token || bearerToken;

  if (!token) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (!decoded.user || typeof decoded.userId !== "string") {
      return res.status(401).json({ error: "invalid token"})
    }
    req.userId = decoded.userId;

    next();
    
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
};