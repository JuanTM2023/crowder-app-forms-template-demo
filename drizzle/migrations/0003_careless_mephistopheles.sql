ALTER TABLE "food_vouchers" ADD COLUMN "public_token" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "food_vouchers" ADD COLUMN "row" text;--> statement-breakpoint
ALTER TABLE "food_vouchers" ADD COLUMN "seat" text;--> statement-breakpoint
ALTER TABLE "food_vouchers" ADD COLUMN "customer_email" text;--> statement-breakpoint
ALTER TABLE "food_vouchers" ADD COLUMN "qr_url" text;--> statement-breakpoint
ALTER TABLE "food_vouchers" ADD COLUMN "table_number" text;--> statement-breakpoint
ALTER TABLE "food_vouchers" ADD COLUMN "redeemed_by" text;--> statement-breakpoint
ALTER TABLE "food_vouchers" ADD CONSTRAINT "food_vouchers_public_token_unique" UNIQUE("public_token");