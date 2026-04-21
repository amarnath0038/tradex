import { pgTable, text, timestamp, numeric, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  email: text("email").notNull().unique(),

  balance: numeric("balance", { precision: 20, scale: 6 })
    .default("10000"),

  createdAt: timestamp("created_at").defaultNow()
});



export const trades = pgTable("trades", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id").notNull(), // FK to users.id

  asset: text("asset").notNull(), // BTC, ETH, SOL
  side: text("side").notNull(),   // long / short

  leverage: numeric("leverage", { precision: 10, scale: 2 }).notNull(),

  entryPrice: numeric("entry_price", { precision: 20, scale: 6 }).notNull(),

  status: text("status").notNull(), // OPEN / CLOSED

  createdAt: timestamp("created_at").defaultNow()
});


