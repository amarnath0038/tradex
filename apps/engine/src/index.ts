import { startPriceSubscriber } from "./consumers/priceSubscriber";
import { initConsumerGroup, startTradeConsumer } from "./consumers/tradeConsumer";



async function start() {
  console.log("Starting services");

  await initConsumerGroup();

  await startPriceSubscriber();
  console.log("Price subscriber ready");

  startTradeConsumer();
  console.log("Trade consumer started");
}

start().catch((err) => {
  console.log("Engine crashed:", err);
  process.exit(1);
});