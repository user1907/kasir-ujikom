import { CustomerCreateSchema, CustomerUpdateSchema } from "@/schemas";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { customers } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const customerRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CustomerCreateSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.db
        .insert(customers)
        .values(input)
        .returning({
          id: customers.id,
          name: customers.name,
          address: customers.address,
          phoneNumber: customers.phoneNumber
        });
    }),

  update: protectedProcedure
    .input(CustomerUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;

      return ctx.db
        .update(customers)
        .set(data)
        .where(eq(customers.id, id))
        .returning({
          id: customers.id,
          name: customers.name,
          address: customers.address,
          phoneNumber: customers.phoneNumber
        });
    }
    ),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db
        .select()
        .from(customers);
    })
});
