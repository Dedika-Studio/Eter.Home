import { COOKIE_NAME } from "@shared/const";
import { RAFFLE_CONFIG } from "@shared/raffle";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { ordersRouter } from "./routers/orders";
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
} from "./db";
import { RAFFLE_PRODUCT } from "./products";
import { orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";

import { sendWhatsAppConfirmation } from "./whatsapp";

// Use LIVE keys if available, fallback to test keys
const stripeSecretKey = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || "";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia" as any,
});
console.log(`[Stripe] Using ${stripeSecretKey.startsWith('sk_live_') ? 'LIVE' : 'TEST'} mode`);

export const appRouter = router({
  system: systemRouter,
  orders: ordersRouter,
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

        const ticketRows = await getTicketsByNumbers(input.ticketNumbers);
        const unavailable = ticketRows.filter(t => t.status !== "available");
        if (unavailable.length > 0) {
          const nums = unavailable.map(t => t.number).join(", ");
          throw new Error(`Boletos no disponibles: ${nums}`);
        }

        const foundNumbers = ticketRows.map(t => t.number);
        const missing = input.ticketNumbers.filter(n => !foundNumbers.includes(n));
        if (missing.length > 0) {
          throw new Error(`Boletos no encontrados: ${missing.join(", ")}`);
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
          success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/cancel?order_id=${orderId}`,
          client_reference_id: orderId.toString(),
          customer_email: input.buyerEmail || undefined,
          metadata: {
            order_id: orderId.toString(),
            buyer_name: input.buyerName,
            buyer_phone: input.buyerPhone,
            ticket_numbers: input.ticketNumbers.join(","),
          },
          expires_at: Math.floor(Date.now() / 1000) + 1800,
          allow_promotion_codes: true,
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

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        image: z.string(),
        totalTickets: z.number(),
        pricePerTicket: z.number(),
        drawDate: z.string(),
        webhookUrl: z.string().optional(),
        category: z.enum(["dinero", "electronica", "herramientas", "kpop", "moda", "otro"]),
      }))
      .mutation(async ({ input }) => {
        return createRaffle({
          title: input.title,
          description: input.description,
          image: input.image,
          totalTickets: input.totalTickets,
          pricePerTicket: Math.round(input.pricePerTicket * 100),
          drawDate: new Date(input.drawDate),
          webhookUrl: input.webhookUrl,
          category: input.category,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        totalTickets: z.number().optional(),
        pricePerTicket: z.number().optional(),
        drawDate: z.string().optional(),
        webhookUrl: z.string().optional(),
        category: z.enum(["dinero", "electronica", "herramientas", "kpop", "moda", "otro"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = {};
        if (data.title) updateData.title = data.title;
        if (data.description) updateData.description = data.description;
        if (data.image) updateData.image = data.image;
        if (data.totalTickets) updateData.totalTickets = data.totalTickets;
        if (data.pricePerTicket) updateData.pricePerTicket = Math.round(data.pricePerTicket * 100);
        if (data.drawDate) updateData.drawDate = new Date(data.drawDate);
        if (data.webhookUrl) updateData.webhookUrl = data.webhookUrl;
        if (data.category) updateData.category = data.category;
        return updateRaffle(id, updateData);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteRaffle(input.id);
      }),

    createCheckout: publicProcedure
      .input(z.object({
        raffleId: z.number(),
        ticketNumbers: z.array(z.string()),
        totalAmount: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const raffle = await getRaffleById(input.raffleId);
        if (!raffle) throw new Error("Rifa no encontrada");

        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price_data: {
                currency: "mxn",
                product_data: {
                  name: raffle.title,
                  description: `${input.ticketNumbers.length} boletos para ${raffle.title}`,
                },
                unit_amount: raffle.pricePerTicket,
              },
              quantity: input.ticketNumbers.length,
            },
          ],
          mode: "payment",
          success_url: `${ctx.req.headers.origin || "http://localhost:3000"}/rifa/${input.raffleId}?success=true`,
          cancel_url: `${ctx.req.headers.origin || "http://localhost:3000"}/rifa/${input.raffleId}?cancelled=true`,
          customer_email: ctx.user?.email || undefined,
          metadata: {
            raffleId: input.raffleId.toString(),
            ticketNumbers: input.ticketNumbers.join(","),
            userId: ctx.user?.id.toString() || "guest",
          },
        } as any);

        return {
          checkoutUrl: session.url,
          sessionId: session.id,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
