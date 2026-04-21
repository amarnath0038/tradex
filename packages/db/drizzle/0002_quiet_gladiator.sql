ALTER TABLE "closed_trades" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "closed_trades" CASCADE;--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "leverage" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "entry_price" SET DATA TYPE numeric(20, 6);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "balance" SET DATA TYPE numeric(20, 6);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "balance" SET DEFAULT '10000';--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password";