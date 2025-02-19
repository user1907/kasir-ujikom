UPDATE "public"."users" SET "level" = 'cashier' WHERE "level" = 'user';--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "level" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."user_levels";--> statement-breakpoint
CREATE TYPE "public"."user_levels" AS ENUM('administrator', 'cashier');--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "level" SET DATA TYPE "public"."user_levels" USING "level"::"public"."user_levels";