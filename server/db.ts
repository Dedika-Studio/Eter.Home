import { eq, inArray, and, lt, sql, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tickets, orders, raffles, type InsertOrder } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== TICKET QUERIES ==========

export async function getAllTickets() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ number: tickets.number, status: tickets.status }).from(tickets);
}

export async function getTicketsByNumbers(numbers: string[]) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tickets).where(inArray(tickets.number, numbers));
}

export async function reserveTickets(numbers: string[], orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = Date.now();
  await db.update(tickets)
    .set({ status: "reserved", orderId, reservedAt: now })
    .where(and(inArray(tickets.number, numbers), eq(tickets.status, "available")));
}

export async function markTicketsSold(orderId: number, buyerName: string, buyerPhone: string, buyerEmail: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = Date.now();
  await db.update(tickets)
    .set({ status: "sold", buyerName, buyerPhone, buyerEmail, soldAt: now })
    .where(eq(tickets.orderId, orderId));
}

export async function releaseExpiredReservations() {
  const db = await getDb();
  if (!db) return;
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  await db.update(tickets)
    .set({ status: "available", orderId: null, reservedAt: null })
    .where(and(eq(tickets.status, "reserved"), lt(tickets.reservedAt, tenMinutesAgo)));
}

export async function releaseTicketsByOrder(orderId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(tickets)
    .set({ status: "available", orderId: null, reservedAt: null })
    .where(and(eq(tickets.orderId, orderId), eq(tickets.status, "reserved")));
}

// ========== ORDER QUERIES ==========

export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data);
  return result[0].insertId;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByStripeSession(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.stripeSessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateOrderStatus(id: number, status: "pending" | "paid" | "failed" | "expired", paymentIntentId?: string) {
  const db = await getDb();
  if (!db) return;
  const updateData: Record<string, unknown> = { status };
  if (paymentIntentId) updateData.stripePaymentIntentId = paymentIntentId;
  await db.update(orders).set(updateData).where(eq(orders.id, id));
}

export async function markOrderSyncedToSheets(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ syncedToSheets: true }).where(eq(orders.id, id));
}

export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId));
}

export async function getOrdersByPhone(phone: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.buyerPhone, phone)).orderBy(desc(orders.createdAt));
}

export async function getAvailableRandomTickets(count: number): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({ number: tickets.number })
    .from(tickets)
    .where(eq(tickets.status, "available"))
    .orderBy(sql`RAND()`)
    .limit(count);
  return result.map(r => r.number);
}

// Raffle functions
export async function createRaffle(raffle: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(raffles).values(raffle);
  return result;
}

export async function getAllRaffles() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(raffles).orderBy(desc(raffles.createdAt));
}

export async function getRaffleById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(raffles).where(eq(raffles.id, id));
  return result[0] || null;
}

export async function updateRaffle(id: number, raffle: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(raffles).set(raffle).where(eq(raffles.id, id));
}

export async function deleteRaffle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(raffles).where(eq(raffles.id, id));
}
