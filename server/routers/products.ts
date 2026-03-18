import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../db";

export const productsRouter = router({
  list: publicProcedure.query(async () => getAllProducts()),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => getProductById(input.id)),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        price: z.number().min(0),
        image: z.string().url(),
        link: z.string().url(),
        rating: z.number().optional(),
        reviews: z.number().optional(),
        badge: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await createProduct({
        title: input.title,
        description: input.description || null,
        price: Math.round(input.price * 100),
        image: input.image,
        link: input.link,
        rating: input.rating ? Math.round(input.rating * 10) : null,
        reviews: input.reviews || 0,
        badge: input.badge || null,
      });
      return result;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        image: z.string().optional(),
        link: z.string().optional(),
        rating: z.number().optional(),
        reviews: z.number().optional(),
        badge: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: Record<string, any> = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.price !== undefined) updateData.price = Math.round(data.price * 100);
      if (data.image !== undefined) updateData.image = data.image;
      if (data.link !== undefined) updateData.link = data.link;
      if (data.rating !== undefined) updateData.rating = data.rating ? Math.round(data.rating * 10) : null;
      if (data.reviews !== undefined) updateData.reviews = data.reviews;
      if (data.badge !== undefined) updateData.badge = data.badge || null;

      return updateProduct(id, updateData);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => deleteProduct(input.id)),
});
