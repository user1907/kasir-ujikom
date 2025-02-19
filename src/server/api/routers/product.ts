import { createTRPCRouter, protectedProcedure } from "../trpc";
import { ProductCreateSchema, ProductUpdateSchema } from "@/schemas";
import { products, productsSchema } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const productRouter = createTRPCRouter({
  create: protectedProcedure
    .input(ProductCreateSchema)
    .mutation(({ input, ctx }) => {
      return ctx.db
        .insert(products)
        .values(input)
        .returning();
    }),

  update: protectedProcedure
    .input(ProductUpdateSchema)
    .mutation(({ input, ctx }) => {
      const { id, ...data } = input;

      return ctx.db
        .update(products)
        .set(data)
        .where(eq(products.id, id))
        .returning();
    }),

  delete: protectedProcedure
    .input(productsSchema.pick({ id: true }))
    .mutation(({ input, ctx }) => {
      return ctx.db
        .update(products)
        .set({ archived: true })
        .where(eq(products.id, input.id))
        .returning();
    }),

  list: protectedProcedure
    .input(z.object({ includeArchived: z.boolean().optional() }))
    .query(({ ctx, input }) => {
      return ctx.db
        .select()
        .from(products)
        .where(input.includeArchived ? undefined : eq(products.archived, false));
    })
});
