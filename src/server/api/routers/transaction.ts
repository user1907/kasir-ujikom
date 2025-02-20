import { products, productsSchema, sales, salesDetails } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { and, eq, gte, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const schema = z.object({
  carts: z.object({
    product: productsSchema,
    quantity: z.number().int().positive()
  }).array(),
  customerId: z.number().int().positive().optional(),
  totalPrice: z.number().int().positive()
});

export const transactionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(schema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (trx) => {
        const availableProducts: typeof products.$inferSelect[] = [];
        // Check every product exists and has enough stock
        for (const cartItem of input.carts) {
          const res = await trx
            .select()
            .from(products)
            .where(and(
              eq(products.id, cartItem.product.id),
              eq(products.deleted, false),
              gte(products.stock, cartItem.quantity)
            ));
          availableProducts.push(...res);
        }

        if (availableProducts.length !== input.carts.length) {
          const diff = input.carts.filter(cartItem => !availableProducts.some(ap => ap.id === cartItem.product.id));

          throw new TRPCError({ code: "NOT_FOUND", message: `These products are not available: \n${diff.map(i => i.product.name).join("\n")}` });
        }

        const productsWithSubtotal = availableProducts.map((p) => {
          const quantity = input.carts.find(cartItem => cartItem.product.id === p.id)!.quantity;
          return { ...p, quantity, subtotal: Number(p.price) * quantity };
        });

        const totalPrice = productsWithSubtotal.reduce((acc, p) => acc + p.subtotal, 0);

        if (totalPrice !== input.totalPrice) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Total price is not valid" });
        }

        const [sale] = await trx
          .insert(sales)
          .values({
            date: new Date().toISOString(),
            totalPrice: totalPrice.toString(),
            customerId: input.customerId,
            userId: ctx.user.id
          })
          .returning();

        const detail = await trx
          .insert(salesDetails)
          .values(productsWithSubtotal.map(p => ({
            salesId: sale!.id,
            productId: p.id,
            amount: p.quantity,
            subTotal: p.subtotal.toString()
          })));

        for (const p of productsWithSubtotal) {
          await trx
            .update(products)
            .set({ stock: sql`${products.stock} - ${p.quantity}` })
            .where(eq(products.id, p.id));
        }

        return {
          ...sale,
          details: detail
        };
      });
    })
});
