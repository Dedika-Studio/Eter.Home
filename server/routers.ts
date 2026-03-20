import { COOKIE_NAME } from "@shared/const";
import { RAFFLE_CONFIG } from "@shared/raffle";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { ordersRouter } from "./routers/orders";
import { productsRouter } from "./routers/products";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import Stripe from "stripe";
import {
  getAllTickets,
  getTicketsByNumbers,
  reserveTickets,
  releaseExpiredReservations,
  releaseTicketsByOrder,
  createOrder,
  getOrderById,
  getAvailableRandomTickets,
  getDb,
  getOrdersByPhone,
  createRaffle,
  getAllRaffles,
  getRaffleById,
  getRaffleByNumber,
  updateRaffle,
  deleteRaffle,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateOrderStatus,
  markTicketsSold,
} from "./db";
import { RAFFLE_PRODUCT } from "./products";
import { orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";

import { sendWhatsAppConfirmation } from "./whatsapp";

// Use TEST keys as requested
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia" as any,
});

console.log(`[Stripe] Using ${stripeSecretKey.startsWith('sk_live_') ? 'LIVE' : 'TEST'} mode`);

export const appRouter = router({
  system: systemRouter,
  orders: ordersRouter,
  products: productsRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  tickets: router({
    list: publicProcedure.query(async () => {
      await releaseExpiredReservations();
      return getAllTickets();
    }),

    check: publicProcedure
      .input(z.object({ numbers: z.array(z.string().length(3)) }))
      .query(async ({ input }) => {
        const ticketRows = await getTicketsByNumbers(input.numbers);
        return ticketRows.map(t => ({ number: t.number, status: t.status }));
      }),

    random: publicProcedure
      .input(z.object({ count: z.number().min(1).max(30) }))
      .query(async ({ input }) => {
        await releaseExpiredReservations();
        return getAvailableRandomTickets(input.count);
      }),
  }),

  checkout: router({
    create: publicProcedure
      .input(
        z.object({
          ticketNumbers: z.array(z.string().length(3)).min(1).max(30),
          buyerName: z.string().min(1),
          buyerPhone: z.string().min(1),
          buyerEmail: z.string().email().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await releaseExpiredReservations();

        // Use phone number as provided by user
        const formattedPhone = input.buyerPhone.trim();

        // Verify tickets are still available
        const ticketRows = await getTicketsByNumbers(input.ticketNumbers);
        const availableTickets = ticketRows.filter(t => t.status === "available");

        if (availableTickets.length !== input.ticketNumbers.length) {
          const foundNumbers = ticketRows.map(t => t.number);
          const missing = input.ticketNumbers.filter(n => !foundNumbers.includes(n));
          if (missing.length > 0) {
            throw new Error(`Boletos no encontrados: ${missing.join(", ")}`);
          }
          throw new Error("Algunos boletos ya no están disponibles. Por favor, intenta con otros.");
        }

        const totalAmount = input.ticketNumbers.length * RAFFLE_CONFIG.pricePerTicket;

        const orderId = await createOrder({
          userId: ctx.user?.id ?? null,
          buyerName: input.buyerName,
          buyerPhone: formattedPhone,
          buyerEmail: input.buyerEmail ?? null,
          ticketNumbers: JSON.stringify(input.ticketNumbers),
          ticketCount: input.ticketNumbers.length,
          totalAmount,
          status: "pending",
        });

        await reserveTickets(input.ticketNumbers, orderId);

        const origin = ctx.req.headers.origin || ctx.req.headers.referer || "";

        try {
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
              {
                price_data: {
                  currency: RAFFLE_PRODUCT.currency,
                  product_data: {
                    name: RAFFLE_PRODUCT.name,
                    description: `${input.ticketNumbers.length} boleto(s): ${input.ticketNumbers.join(", ")}`,
                    images: RAFFLE_PRODUCT.images,
                  },
                  unit_amount: RAFFLE_PRODUCT.unitAmount,
                },
                quantity: input.ticketNumbers.length,
              },
            ],
            mode: "payment",
            // Include order_id in success_url for manual confirmation backup
            success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
            cancel_url: `${origin}/cancel?order_id=${orderId}`,
            client_reference_id: orderId.toString(),
            customer_email: input.buyerEmail || undefined,
            metadata: {
              order_id: orderId.toString(),
              buyer_name: input.buyerName,
              buyer_phone: formattedPhone,
            },
          });

          const db = await getDb();
          if (db) {
            await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, orderId));
          }

          return {
            checkoutUrl: session.url,
            sessionId: session.id,
            orderId,
          };
        } catch (stripeError) {
          // If Stripe fails, release the reserved tickets immediately
          console.error("[Checkout] Stripe session creation failed:", stripeError);
          await releaseTicketsByOrder(orderId);
          throw new Error("Error al crear la sesión de pago. Por favor, intenta de nuevo.");
        }
      }),

    status: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        const order = await getOrderById(input.orderId);
        if (!order) throw new Error("Orden no encontrada");
        return {
          id: order.id,
          status: order.status,
          ticketNumbers: JSON.parse(order.ticketNumbers) as string[],
          ticketCount: order.ticketCount,
          totalAmount: order.totalAmount,
          buyerName: order.buyerName,
          createdAt: order.createdAt,
        };
      }),

    confirmPayment: publicProcedure
      .input(z.object({
        orderId: z.number(),
        sessionId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const order = await getOrderById(input.orderId);
        if (!order) throw new Error("Orden no encontrada");

        if (order.status === "paid") {
          console.log(`[Confirm Payment] Order ${order.id} already paid, skipping`);
          return { success: true, message: "Order already confirmed" };
        }

        // Verify with Stripe
        const session = await stripe.checkout.sessions.retrieve(input.sessionId);
        if (session.payment_status !== "paid") {
          throw new Error("Payment not completed");
        }

        // Update order status to paid
        await updateOrderStatus(order.id, "paid", session.payment_intent as string);

        // Mark tickets as sold with buyer information from the order
        const ticketNumbers = JSON.parse(order.ticketNumbers) as string[];
        await markTicketsSold(order.id, ticketNumbers, order.buyerName, order.buyerPhone, order.buyerEmail);

        // Send WhatsApp confirmation if phone is available
        if (order.buyerPhone) {
          const ticketNumbers = JSON.parse(order.ticketNumbers) as string[];
          const whatsappPhone = `+52${order.buyerPhone}`;
          await sendWhatsAppConfirmation({
            to: whatsappPhone,
            ticketNumbers,
            buyerName: order.buyerName,
            totalAmount: order.totalAmount,
          }).catch(err => console.error("[WhatsApp] Failed to send confirmation:", err));
        }

        console.log(`[Confirm Payment] Order ${order.id} confirmed manually. Tickets marked as sold.`);
        return { success: true, message: "Payment confirmed and tickets registered" };
      })
  }),

  raffles: router({
    list: publicProcedure.query(async () => {
      return getAllRaffles();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getRaffleById(input.id);
      }),

    getByNumber: publicProcedure
      .input(z.object({ raffleNumber: z.number() }))
      .query(async ({ input }) => {
        return getRaffleByNumber(input.raffleNumber);
      }),

    create: publicProcedure
      .input(z.object({
        raffleNumber: z.number(),
        title: z.string(),
        description: z.string(),
        imageUrl: z.string().optional(),
        price: z.number(),
        totalTickets: z.number(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        return createRaffle(input);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.any(),
      }))
      .mutation(async ({ input }) => {
        return updateRaffle(input.id, input.data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteRaffle(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
