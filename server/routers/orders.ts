import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getOrdersByPhone } from "../db";
import { formatPhoneMX } from "@shared/phone";

export const ordersRouter = router({
  getByPhone: publicProcedure
    .input(z.object({ phone: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        const formattedPhone = formatPhoneMX(input.phone);
        const orders = await getOrdersByPhone(formattedPhone);
        
        return orders.map(order => ({
          id: order.id,
          buyerName: order.buyerName,
          ticketNumbers: JSON.parse(order.ticketNumbers) as string[],
          ticketCount: order.ticketCount,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
        }));
      } catch (error) {
        throw new Error("Número de teléfono inválido. Debe ser un número mexicano de 10 dígitos.");
      }
    }),
});
