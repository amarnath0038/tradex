import { db, users } from "@repo/db";
import { signToken, verifyToken } from "../lib/jwt";
import { sendMagicLink } from "../lib/email";
import { Request, Response } from "express";

export const requestLink = async (req: Request, res: Response) => {
  const { email } = req.body;

  let user = await db.query.users.findFirst({
    where: (u, {eq}) => eq(u.email, email)
  });

  if (!user) {
    const result = await db.insert(users).values({ email }).returning();
    user = result[0];
  }

  if (!user) {
    return res.status(500).json({ error: "user creation failed"})
  }

  const token = signToken({ userId: user.id }, "15m");

  await sendMagicLink(email, token);

  res.json({ message: "email sent" });
};

export const verify = async (req: Request, res: Response) => {
  const { token } = req.body;

  const decoded = verifyToken(token);

  const sessionToken = signToken({ userId: decoded.userId }, "7d");

  res.cookie("token", sessionToken, {
    httpOnly: true,
    sameSite: "lax"
  });

  res.json({ message: "logged in" });
};