import { db } from "@repo/db";
import { Request, Response } from "express";
import { signToken } from "../lib/jwt";

const isProduction = process.env.NODE_ENV === "production";

export const whoami = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId)
  });

  if (!user) {
    return res.status(404).json({ error: "user not found"})
  }
  return res.json({
    user: {
      id: user.id,
      email: user.email,
    },
    account: {
      balance: Number(user.balance)
    }
  });
};

export const wsToken = (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "unauthorized"})
  }

  const token = signToken({
    userId,
    purpose: "ws"
  }, "30s")

  return res.json({ token })
}

