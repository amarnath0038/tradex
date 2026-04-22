import { pgTable, text, timestamp, numeric, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  email: text("email").notNull().unique(),

  balance: numeric("balance", { precision: 20, scale: 4 })
    .default("10000"),

  createdAt: timestamp("created_at").defaultNow()
});



export const trades = pgTable("trades", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id").notNull().references(() => users.id), // FK to users.id

  asset: text("asset").notNull(), // BTC, ETH, SOL
  side: text("side").notNull(),   // long / short

  leverage: numeric("leverage", { precision: 10, scale: 2 }).notNull(),

  positionSize: numeric("position_size", { precision: 20, scale: 6}).notNull(),

  marginUsed: numeric("margin_used", { precision: 20, scale: 4}).notNull(),

  entryPrice: numeric("entry_price", { precision: 20, scale: 4 }).notNull(),

  exitPrice: numeric("exit_price", { precision: 20, scale: 4 }),

  status: text("status").notNull(), // OPEN / CLOSED

  createdAt: timestamp("created_at").defaultNow()
});


