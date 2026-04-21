import { db } from "@repo/db";
import { Request, Response } from "express";

export const whoami = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId)
  });
  return res.json(user);
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  return res.json({ message: "logged out" });
};