import { startPriceSubscriber } from "./consumers/priceSubscriber";
import { initConsumerGroup, startTradeConsumer } from "./consumers/tradeConsumer";
import { initTradeEventsPersisterGroup, startTradeEventsPersister } from "./consumers/tradeEventsPersister";
import { loadTradingState } from "./services/loadTradingState";
import { warmupEngine } from "./utils/warmupEngine";


async function startEngine() {
  try {

    await warmupEngine();
    await loadTradingState();

    console.log("Starting services");

    await initConsumerGroup();
    await initTradeEventsPersisterGroup();

    await startPriceSubscriber();
    console.log("Price subscriber ready");

    startTradeEventsPersister().catch((err) => {
      console.error("Trade events persister crashed:", err);
      process.exit(1);
    });

    startTradeConsumer().catch((err) => {
      console.error("Trade consumer crashed:", err);
      process.exit(1);
    });
    console.log("Trade consumer started");

  } catch(err) {
    console.log("Engine crashed:", err);
    process.exit(1);
  };
}

startEngine();