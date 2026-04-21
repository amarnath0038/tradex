import jwt, { SignOptions } from "jsonwebtoken";
import { JWT_SECRET } from "./env";

type JwtUser = {
  userId: string;
};

export const signToken = (payload: JwtUser, expiresIn: SignOptions["expiresIn"]) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string): JwtUser => {
  return jwt.verify(token, JWT_SECRET) as JwtUser;
};