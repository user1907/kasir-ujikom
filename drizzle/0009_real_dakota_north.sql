ALTER TABLE "sales" ALTER COLUMN "totalPrice" SET DATA TYPE numeric(16, 0);--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "totalPrice" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_details" ALTER COLUMN "salesId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_details" ALTER COLUMN "productId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_details" ALTER COLUMN "subTotal" SET DATA TYPE numeric(16, 0);