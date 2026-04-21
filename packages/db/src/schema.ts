import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  balance: integer("balance").default(10000), 
  createdAt: timestamp("created_at").defaultNow()
});


export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  asset: text("asset").notNull(), // BTC, ETH, SOL
  side: text("side").notNull(),   // long/short
  leverage: integer("leverage").notNull(),
  entryPrice: integer("entry_price").notNull(),
  status: text("status").notNull(), // OPEN/CLOSED
  createdAt: timestamp("created_at").defaultNow()
});


export const closedTrades = pgTable("closed_trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tradeId: integer("trade_id").notNull(),
  exitPrice: integer("exit_price").notNull(),
  pnl: integer("pnl").notNull(),
  closedAt: timestamp("closed_at").defaultNow()
});