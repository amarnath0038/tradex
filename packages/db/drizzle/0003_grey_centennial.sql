ALTER TABLE "trades" ALTER COLUMN "entry_price" SET DATA TYPE numeric(20, 4);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "balance" SET DATA TYPE numeric(20, 4);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "balance" SET DEFAULT '10000';--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "position_size" numeric(20, 6) NOT NULL;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "margin_used" numeric(20, 4) NOT NULL;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;