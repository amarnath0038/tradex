import { sub, REDIS_KEYS } from "@repo/redis";
import { WSServer } from "./server";

const PORT = Number(process.env.WS_PORT) || 8080;
const wsServer = new WSServer(PORT);

async function start() {
    console.log(`WS server started on port ${PORT}`);

    await sub.subscribe(REDIS_KEYS.PRICE_CHANNEL, REDIS_KEYS.USER_STATE_UPDATES);
    console.log("WS subscribed to redis channels")

    sub.on("message", (channel, message) => {
        let data: any
        try {
            data = JSON.parse(message);
        } catch (err) {
            console.error("Invalid redis message", channel, message);
            return;
        }
    

        if (channel === REDIS_KEYS.PRICE_CHANNEL) {
            wsServer.broadcast({
                type: "PRICE_UPDATE", 
                data
            })
            return;
        }

        if (channel === REDIS_KEYS.USER_STATE_UPDATES) {
            if (!data.userId) {
                console.error("USER_STATE_UPDTE missing userId", data)
                return;
            }

            wsServer.sendToUser(data.userId, {
                type: data.type,
                data: data.data
            })
            return;
        }
    })
}

start().catch((err) => {
    console.error("WS server crashed", err);
    process.exit(1);
});