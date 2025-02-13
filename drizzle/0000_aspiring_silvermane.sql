CREATE TYPE "public"."user_levels" AS ENUM('administrator', 'user');--> statement-breakpoint
CREATE TABLE "customers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"phoneNumber" varchar(15) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"stock" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sales_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"date" date NOT NULL,
	"totalPrice" numeric(10, 2),
	"customerId" integer,
	"userId" integer
);
--> statement-breakpoint
CREATE TABLE "sales_details" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sales_details_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"salesId" integer,
	"productId" integer,
	"amount" integer NOT NULL,
	"subTotal" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" text NOT NULL,
	"level" "user_levels" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_customerId_customers_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sales_details" ADD CONSTRAINT "sales_details_salesId_sales_id_fk" FOREIGN KEY ("salesId") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sales_details" ADD CONSTRAINT "sales_details_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE cascade;