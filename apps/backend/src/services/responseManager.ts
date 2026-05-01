
import { REDIS_KEYS, sub } from "@repo/redis";
import { TradeResponse } from "@repo/types";

type PendingEntry = {
  resolve: (data: TradeResponse) => void;
  reject: (err: Error) => void;
  timeout: NodeJS.Timeout;
};

const pending = new Map<string, PendingEntry>();

let isInitialized = false;

export const initResponseListener = async () => {
  if (isInitialized) {
    console.log("Response listener already initialized");
    return;
  }

  isInitialized = true;

  await sub.subscribe(REDIS_KEYS.TRADE_RESPONSES);

  console.log("Subscribed to trade responses");

  sub.on("message", (channel, message) => {
    if (channel !== REDIS_KEYS.TRADE_RESPONSES) return;

    const data: TradeResponse = JSON.parse(message);

    console.log("Received response:", data.requestId, data.status);

    const entry = pending.get(data.requestId);

    if (!entry) {
      console.log("No pending request for:", data.requestId);
      return;
    }

    clearTimeout(entry.timeout);
    pending.delete(data.requestId);

    entry.resolve(data);
  });
};

export const waitForResponse = (requestId: string): Promise<TradeResponse> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(requestId);
      reject(new Error("Engine timeout"));
    }, 5000);

    pending.set(requestId, {
      resolve,
      reject,
      timeout,
    });
  });
};

