import express, { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authRoutes } from "./routes/auth.routes.js";
import { tradeRoutes } from "./routes/trade.routes.js";
import { userRoutes } from "./routes/user.routes.js";

const app: Express = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/trade", tradeRoutes);
app.use("/api/v1/user", userRoutes);

export default app;