// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { date, decimal, integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

export const userLevel = pgEnum("user_levels", ["administrator", "user"]);

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  username: varchar({ length: 50 }).notNull(),
  password: text().notNull(),
  passwordUpdatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  level: userLevel().notNull()
});
export const usersSchema = createSelectSchema(users, {
  username: type => type.max(50).regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric"),
  password: type => type.min(8, "Password must be at least 8 characters")
});

export const products = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
  stock: integer().notNull()
});

export const customers = pgTable("customers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  address: text().notNull(),
  phoneNumber: varchar({ length: 15 }).notNull()
});

export const sales = pgTable("sales", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  date: date().notNull(),
  totalPrice: decimal({ precision: 10, scale: 2 }),
  customerId: integer().references(() => customers.id, { onDelete: "restrict", onUpdate: "cascade" }),
  userId: integer().references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" })
});

export const salesDetails = pgTable("sales_details", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  salesId: integer().references(() => sales.id, { onDelete: "cascade", onUpdate: "cascade" }),
  productId: integer().references(() => products.id, { onDelete: "restrict", onUpdate: "cascade" }),
  amount: integer().notNull(),
  subTotal: decimal({ precision: 10, scale: 2 }).notNull()
});
