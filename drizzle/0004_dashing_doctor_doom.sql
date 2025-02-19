ALTER TABLE "sales" DROP CONSTRAINT "sales_customerId_customers_id_fk";
--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_customerId_customers_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE cascade;