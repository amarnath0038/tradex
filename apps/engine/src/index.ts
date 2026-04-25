import { startPriceloop } from "./services/priceloop";
import { startRedisStream } from "./services/redisStream";

async function start() {
  console.log("Engine started...");

  startPriceloop();
  startRedisStream();
}

start();