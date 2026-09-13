CREATE TABLE "food_voucher_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"voucher_id" uuid NOT NULL,
	"product_name" text NOT NULL,
	"quantity_purchased" integer NOT NULL,
	"quantity_redeemed" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_voucher_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"voucher_id" uuid NOT NULL,
	"voucher_line_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"redeemed_by" text,
	"redeemed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_vouchers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"voucher_number" text NOT NULL,
	"transaction_id" text NOT NULL,
	"partner_item_uuid" text NOT NULL,
	"item_uuid" text,
	"customer_name" text,
	"event_name" text NOT NULL,
	"show" text,
	"sector_name" text,
	"section_name" text,
	"product_name" text NOT NULL,
	"price" double precision NOT NULL,
	"service_fee" double precision DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"redeemed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "food_voucher_lines" ADD CONSTRAINT "food_voucher_lines_voucher_id_food_vouchers_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."food_vouchers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_voucher_redemptions" ADD CONSTRAINT "food_voucher_redemptions_voucher_id_food_vouchers_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."food_vouchers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_voucher_redemptions" ADD CONSTRAINT "food_voucher_redemptions_voucher_line_id_food_voucher_lines_id_fk" FOREIGN KEY ("voucher_line_id") REFERENCES "public"."food_voucher_lines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_vouchers" ADD CONSTRAINT "food_vouchers_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;