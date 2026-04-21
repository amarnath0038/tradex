import { z } from "zod";

const envSchema = z.object({
    JWT_SECRET: z.string(),
    DATABASE_URL: z.string(),
    RESEND_API_KEY: z.string()
})

export const env = envSchema.parse(process.env);