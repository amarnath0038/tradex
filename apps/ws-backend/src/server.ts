import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET as string;;
type Client = {
    ws: WebSocket;
    userId?: string;
}

export class WSServer {
    private wss: WebSocketServer;
    private clients: Set<Client> = new Set();

    constructor(port: number) {
        this.wss = new WebSocketServer({port});

        this.wss.on("connection", (ws) => {
            const client: Client = {ws};
            this.clients.add(client);
            console.log("Client connected");

            ws.on("close", () => {
                this.clients.delete(client);
                console.log("Client disconnected");
            })

            ws.on("message", (msg) => {
                this.handleMessage(client, msg.toString());
            })
        })
    }

    private handleMessage(client:Client, msg: string) {
        try {
            const data = JSON.parse(msg);
            if (data.type === "AUTH") {
                const decoded = jwt.verify(data.token, SECRET);
                if (typeof decoded !== "object" || !("userId" in decoded)) {
                    throw new Error("Inavlid token");
                }
                client.userId = decoded.userId as string;
                console.log("Authenticated", client.userId);

            }
            
        } catch(err) {
            console.log("JWT verification failed");
            client.ws.close();
        }
            
        }
        broadcast(data: any) {
            const payload = JSON.stringify(data);
            for (const client of this.clients ) {
                client.ws.send(payload);
            }
        }

        sendToUser(userId: string, data: any) {
            const payload = JSON.stringify(data);
            for (const client of this.clients) {
                if (client.userId === userId) {
                    client.ws.send(payload);
                }
            }
        }
    }
