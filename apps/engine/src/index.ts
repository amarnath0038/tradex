import { redis } from "@repo/redis";
import { updatePrices, getPrice } from "./priceStore";
import { handleOpenTrade } from "./handlers/openTrade";
import { handleCloseTrade } from "./handlers/closeTrade";

async function start() {
  console.log("Engine started...");

  setInterval(() => {
    updatePrices();
    console.log("BTC:", getPrice("BTC"));
  }, 2000);

  //Event listener 
  let lastId = "$";
  while (true) {
    const response = await redis.xread(
      "BLOCK", 0,
      "STREAMS",
      "stream:app:info",
      lastId
    );

    if (!response || response.length === 0) continue;

    const stream = response[0];
    if (!stream) continue;

    // extract message
    const messages = stream[1];
    if (!messages || messages.length === 0) continue;

    for (const message of messages) {
      const id = message[0];
      const fields = message[1]

      if (!fields) continue;

      // convert to object
      const data: Record<string, string> = {};

      for (let i = 0; i < fields.length; i += 2) {
          const key = fields[i];
          const value = fields[i + 1];

          if ( key === undefined || value === undefined) continue;
          data[key] = value;
      
      }

      console.log("Parsed event:", data)
      try {
        switch (data.type) {
          case "OPEN_TRADE":
            await handleOpenTrade(data);
            break;
          case "CLOSE_TRADE":
            await handleCloseTrade(data);
            break;
          default:
            console.log("Unkonwn event type: ", data.type);
        }
        lastId = id;
      } catch (err) {
        console.log("Error processing event", err)
      }
    }
  }
}

start();