import { Redis } from "ioredis";

const url = process.env.REDIS_URL || "redis://localhost:6379";

export const pub = new Redis(url);
export const sub = new Redis(url);
export const stream = new Redis(url);

pub.on("connect", () => {console.log("Redis connected");});
sub.on("connect", () => {console.log("Redis connected");});
stream.on("connect", () => {console.log("Redis connected");});


pub.on("error", (err: Error) => {console.error("Redis error:", err);});
sub.on("error", (err: Error) => {console.error("Redis error:", err);});
stream.on("error", (err: Error) => {console.error("Redis error:", err);});