import { customersSchema, productsSchema, usersSchema } from "@/server/db/schema";
import { z } from "zod";

export const LoginSchema = usersSchema.pick({ username: true, password: true });

export const UserCreateSchema = usersSchema.pick({ name: true, username: true, password: true, level: true });
export const UserUpdateSchema = usersSchema.pick({ id: true })
  .merge(
    usersSchema.pick({ name: true, username: true, level: true }).partial()
  )
  .and(
    usersSchema.pick({ password: true }).partial().or(z.object({ password: z.literal("") }).partial())
  );

export const CustomerCreateSchema = customersSchema.pick({ name: true, address: true, phoneNumber: true });
export const CustomerUpdateSchema = customersSchema.pick({ id: true })
  .merge(
    customersSchema.pick({ name: true, address: true, phoneNumber: true }).partial()
  );

export const ProductCreateSchema = productsSchema.pick({ name: true, price: true, stock: true });
export const ProductUpdateSchema = customersSchema.pick({ id: true })
  .merge(
    productsSchema.pick({ name: true, price: true, stock: true }).partial()
  );

export const TransactionCreateSchema = z.object({
  carts: z.object({
    product: productsSchema,
    quantity: z.number().int().positive()
  }).array(),
  customerId: z.number().int().positive().optional(),
  totalPrice: z.number().int().positive()
});
