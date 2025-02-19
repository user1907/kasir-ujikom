ALTER TABLE "products" ADD COLUMN "archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "products_name_index" ON "products" USING btree ("name");--> statement-breakpoint
CREATE INDEX "products_archived_index" ON "products" USING hash ("archived");