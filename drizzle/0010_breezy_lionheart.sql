ALTER TABLE "products" RENAME COLUMN "archived" TO "deleted";--> statement-breakpoint
DROP INDEX "products_archived_index";