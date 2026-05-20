import { db, users } from "@repo/db";
import { signToken, verifyToken } from "../lib/jwt";
import { sendMagicLink } from "../lib/email";
import { Request, Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const requestLink = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "email required"})
  }

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

  return res.json({ message: "email sent", token: token });
};

export const verify = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ errror: "token required"})
  }

  const decoded = verifyToken(token);

  const user = await db.query.users.findFirst({
    where: (u,{eq}) => eq(u.id, decoded.userId)
  })

  if (!user) {
    return res.status(404).json({ error: "user not found"})
  }
  const sessionToken = signToken({ userId: decoded.userId }, "7d");

  res.cookie("token", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 7 * 24 * 60 * 1000
  });

  return res.json({ 
    message: "logged in",
    user: {
      id: user.id,
      email: user.email
    } 
  });
};


export const logout = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/"
  });
  return res.json({ message: "logged out" });
};

