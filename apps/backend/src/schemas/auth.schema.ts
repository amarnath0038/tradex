import { z } from "zod";

export const requestLinkSchema = z.object({
  email: z.string().email()
});

export const verifySchema = z.object({
  token: z.string()
});