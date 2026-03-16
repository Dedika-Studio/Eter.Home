import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  getAllTickets: vi.fn().mockResolvedValue([
    { number: "000", status: "available" },
    { number: "001", status: "available" },
    { number: "002", status: "sold" },
    { number: "003", status: "reserved" },
    { number: "004", status: "available" },
  ]),
  getTicketsByNumbers: vi.fn().mockImplementation(async (numbers: string[]) => {
    const data: Record<string, any> = {
      "000": { number: "000", status: "available", orderId: null },
      "001": { number: "001", status: "available", orderId: null },
      "002": { number: "002", status: "sold", orderId: 1 },
      "003": { number: "003", status: "reserved", orderId: 2 },
      "004": { number: "004", status: "available", orderId: null },
    };
    return numbers.map(n => data[n]).filter(Boolean);
  }),
  reserveTickets: vi.fn().mockResolvedValue(undefined),
  releaseExpiredReservations: vi.fn().mockResolvedValue(undefined),
  createOrder: vi.fn().mockResolvedValue(1),
  getOrderById: vi.fn().mockResolvedValue({
    id: 1,
    status: "paid",
    ticketNumbers: '["000","001"]',
    ticketCount: 2,
    totalAmount: 600,
    buyerName: "Test User",
    createdAt: new Date(),
  }),
  getAvailableRandomTickets: vi.fn().mockResolvedValue(["005", "006", "007"]),
  getDb: vi.fn().mockResolvedValue({
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  }),
}));

// Mock Stripe
vi.mock("stripe", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            id: "cs_test_123",
            url: "https://checkout.stripe.com/test",
          }),
        },
      },
    })),
  };
});

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {
        origin: "https://example.com",
      },
    } as any,
    res: {
      clearCookie: vi.fn(),
    } as any,
  };
}

describe("tickets.list", () => {
  it("returns all tickets with their status", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tickets.list();
    expect(result).toHaveLength(5);
    expect(result[0]).toHaveProperty("number");
    expect(result[0]).toHaveProperty("status");
  });
});

describe("tickets.check", () => {
  it("returns status for specific ticket numbers", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tickets.check({ numbers: ["000", "002"] });
    expect(result).toHaveLength(2);
    expect(result[0].number).toBe("000");
    expect(result[0].status).toBe("available");
    expect(result[1].number).toBe("002");
    expect(result[1].status).toBe("sold");
  });
});

describe("tickets.random", () => {
  it("returns random available tickets", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tickets.random({ count: 3 });
    expect(result).toHaveLength(3);
    expect(result).toEqual(["005", "006", "007"]);
  });
});

describe("checkout.create", () => {
  it("creates a checkout session for available tickets", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.checkout.create({
      ticketNumbers: ["000", "001"],
      buyerName: "Test User",
      buyerPhone: "6571921509",
      buyerEmail: "test@example.com",
    });
    expect(result).toHaveProperty("checkoutUrl");
    expect(result).toHaveProperty("sessionId");
    expect(result).toHaveProperty("orderId");
    expect(result.checkoutUrl).toBe("https://checkout.stripe.com/test");
  });

  it("rejects checkout for sold tickets", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.checkout.create({
        ticketNumbers: ["002"],
        buyerName: "Test User",
        buyerPhone: "6571921509",
      })
    ).rejects.toThrow("Boletos no disponibles");
  });
});

describe("checkout.status", () => {
  it("returns order status", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.checkout.status({ orderId: 1 });
    expect(result.id).toBe(1);
    expect(result.status).toBe("paid");
    expect(result.ticketNumbers).toEqual(["000", "001"]);
    expect(result.buyerName).toBe("Test User");
  });
});
