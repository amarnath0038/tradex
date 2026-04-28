import { sub } from "@repo/redis";
import { WSServer } from "./server";

const wsServer = new WSServer(8080);

async function start() {
    console.log("WS server started");
    await sub.subscribe("channel:prices", "channel:trades");

    sub.on("message", (channel, message) => {
        const data = JSON.parse(message);

        if (channel === "channel:prices") {
            wsServer.broadcast({
                type: "PRICE_UPDATE", ...data
            })
        }

        if (channel === "chanel:trades") {
            wsServer.sendToUser(data.userId, {
                type: "TRADE_UPDATE",
                ...data
            })
        }
    })
}

start();