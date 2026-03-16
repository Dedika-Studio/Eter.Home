import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tickets table: each row = one raffle ticket (000-999).
 * status: available | reserved | sold
 * reserved = temporarily held during checkout (expires after 10 min)
 */
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  number: varchar("number", { length: 3 }).notNull().unique(),
  status: mysqlEnum("status", ["available", "reserved", "sold"]).default("available").notNull(),
  buyerName: varchar("buyerName", { length: 255 }),
  buyerPhone: varchar("buyerPhone", { length: 20 }),
  buyerEmail: varchar("buyerEmail", { length: 320 }),
  userId: int("userId"),
  orderId: int("orderId"),
  reservedAt: bigint("reservedAt", { mode: "number" }),
  soldAt: bigint("soldAt", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

/**
 * Orders table: tracks each purchase attempt.
 * Stores Stripe checkout session ID and payment intent ID.
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  buyerName: varchar("buyerName", { length: 255 }).notNull(),
  buyerPhone: varchar("buyerPhone", { length: 20 }).notNull(),
  buyerEmail: varchar("buyerEmail", { length: 320 }),
  ticketNumbers: text("ticketNumbers").notNull(),
  ticketCount: int("ticketCount").notNull(),
  totalAmount: int("totalAmount").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "failed", "expired"]).default("pending").notNull(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  syncedToSheets: boolean("syncedToSheets").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;