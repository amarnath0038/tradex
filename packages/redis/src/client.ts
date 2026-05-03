import { Redis } from "ioredis";

const url = process.env.REDIS_URL || "redis://localhost:6379";

const createClient = (name: string) => {
  const client = new Redis(url, {
    // retry strategy if redis goes down
    retryStrategy(times) {
      return Math.min(times*50, 2000);
    }
  });

  client.on("connect", () => {
    console.log(`Redis:${name} connected.`);
  })

  client.on("ready", () => {
    console.log(`Redis:${name} ready.`);
  })

  client.on("error", (err) => {
    console.log(`Redis:${name} error.`, err.message);
  })

  client.on("close", () => {
    console.warn(`Redis:${name} closed`)
  })

  client.on("reconnecting", () => {
    console.log(`Redis:${name} reconnecting.`);
  })

  return client;
}


export const pub = createClient("pub");
export const sub = createClient("sub");

export const redisCommand = createClient("command");

export const tradeCommandReader = createClient("trade-command-reader");

export const tradeEventReader = createClient("trade-event-reader");

export const state = createClient("state");   // GET/SET current system state












