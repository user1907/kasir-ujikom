// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { boolean, date, decimal, index, integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const userLevel = pgEnum("user_levels", ["administrator", "cashier"]);

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  username: varchar({ length: 50 }).notNull(),
  password: text().notNull(),
  passwordUpdatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  level: userLevel().notNull(),
  deleted: boolean().notNull().default(false)
});
export const usersSchema = createSelectSchema(users, {
  name: type => type.min(2, "Nama minimal 2 karakter"),
  username: type => type.max(50).regex(/^[a-zA-Z0-9_]+$/, "Username harus berupa huruf, angka, dan underscore"),
  password: type => type.min(8, "Password minimal 8 karakter")
});

export const products = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  price: decimal({ precision: 16, scale: 0 }).notNull(),
  stock: integer().notNull(),
  deleted: boolean().notNull().default(false)
}, table => [
  index().using("btree", table.name)
]);
export const productsSchema = createSelectSchema(products, {
  name: type => type.min(2, "Nama minimal 2 karakter"),
  price: type => type.min(0, "Harga tidak boleh negatif"),
  stock: z.coerce.number().min(0, "Stok tidak boleh negatif")
});

export const customers = pgTable("customers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  address: text().notNull(),
  phoneNumber: varchar({ length: 15 }).notNull()
});
export const customersSchema = createSelectSchema(customers, {
  name: type => type.min(2, "Nama minimal 2 karakter"),
  address: type => type.min(5, "Alamat minimal 5 karakter"),
  phoneNumber: type => type.regex(/^\+?[0-9]+$/, "Nomor telepon hanya boleh berupa angka")
});

export const sales = pgTable("sales", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  date: date().notNull(),
  totalPrice: decimal({ precision: 16, scale: 0 }).notNull(),
  customerId: integer().references(() => customers.id, { onDelete: "set null", onUpdate: "cascade" }),
  userId: integer().notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" })
});

export const salesDetails = pgTable("sales_details", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  salesId: integer().notNull().references(() => sales.id, { onDelete: "cascade", onUpdate: "cascade" }),
  productId: integer().notNull().references(() => products.id, { onDelete: "restrict", onUpdate: "cascade" }),
  amount: integer().notNull(),
  subTotal: decimal({ precision: 16, scale: 0 }).notNull()
});
