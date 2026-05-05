import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { AuthPayload, JwtPayload } from "@repo/types";

const SECRET = process.env.JWT_SECRET as string;

type Client = {
    ws: WebSocket;
    userId?: string;
    isAlive: boolean;
}


const isAuthPayload = (data: any): data is AuthPayload => {
    if (typeof data !== "object" || data === null) {
        return false;
    }
    const obj = data as Record<string, unknown>;
    return (
        obj.type === "AUTH" && typeof obj.token === "string"
    )  
}

const safeJsonParse = (msg: string) => {
    try {
        return JSON.parse(msg);
    } catch {
        return null;
    }
}

export class WSServer {
    private wss: WebSocketServer;
    private clients = new Set<Client>();
    private userClients = new Map<string, Set<Client>>();
    private heartbeatInterval: NodeJS.Timeout;

    constructor(port: number) {
        this.wss = new WebSocketServer({port});

        this.wss.on("connection", (ws) => {
            const client: Client = {ws, isAlive: true};
            this.clients.add(client);
            console.log("Client connected");

            ws.on("pong", () => {
                client.isAlive = true;
            })

            ws.on("close", () => {
                this.removeClient(client);
                console.log("Client disconnected");
            })

            ws.on("message", (msg) => {
                this.handleMessage(client, msg.toString());
            })

            ws.on("error", () => {
                this.removeClient(client)
            })

            this.send(client, {
                type: "CONNECTED",
                message: "Websocket connected"
            })
        })

        this.heartbeatInterval = setInterval(() => {
            this.heartbeat()
        }, 30000);

        this.wss.on("close", () => {
            clearInterval(this.heartbeatInterval)
        })
    }

    private handleMessage(client:Client, msg: string) {
    
        const data = safeJsonParse(msg);
        if (!data) {
            this.send(client, {
                type: "ERROR",
                message: "Invalid JSON"
            })
            return;
        }

        if (isAuthPayload(data)) {
                this.authenticate(client, data.token);
                return;
        }
        this.send(client, {
            type: "ERROR",
            message: "Unkown message type"
        })     
    }


    private authenticate(client: Client, token: string) {
        try {
            const decoded = jwt.verify(token, SECRET) as JwtPayload;

            if (!decoded.userId) {
                throw new Error("Invalid token payload")
            }

            //remove previous association
            if (client.userId) {
                this.detachUser(client);
            }

            client.userId = decoded.userId;

            //get existing connnections
            let clientsForUser = this.userClients.get(client.userId);

            if (!clientsForUser) {
                clientsForUser = new Set();
                this.userClients.set(client.userId, clientsForUser)
            }
            clientsForUser.add(client);

            this.send(client, {
                type: "AUTHENTICATED",
                userId: client.userId,
            })
            console.log("WS authenticated", client.userId);
        
        } catch (err) {
            this.send(client, {
                type: "AUTH_FAILED",
                message: "Invalid token"
            })
            console.log("WS auth failed", err);

            client.ws.close();
        }
    }


    private detachUser(client: Client) {
        if (!client.userId) return;

        const clientsForUser = this.userClients.get(client.userId);

        if (!clientsForUser) return;

        clientsForUser.delete(client);

        //cleaning up empty users
        if (clientsForUser.size === 0) {
            this.userClients.delete(client.userId);
        }
    }


    private removeClient(client: Client) {
        this.detachUser(client);
        this.clients.delete(client);
    }

    private heartbeat() {
        for (const client of this.clients) {
            if (!client.isAlive) {
                client.ws.terminate()
                this.removeClient(client)
                continue;
            }

            client.isAlive = false;
            client.ws.ping();
        }
    }

    private send(client: Client, data: unknown) {
        if (client.ws.readyState !== WebSocket.OPEN) return;
        client.ws.send(JSON.stringify(data))
    }

    broadcast(data: unknown) {
        for (const client of this.clients) {
            this.send(client, data);
        }
    }

    sendToUser(userId: string, data: unknown) {
        const clientsForUser = this.userClients.get(userId);

        if (!clientsForUser) return;

        for (const client of clientsForUser) {
            this.send(client, data);
        }
    }
}
