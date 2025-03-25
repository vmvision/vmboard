ALTER TABLE "vm" RENAME COLUMN "token" TO "probe_token";--> statement-breakpoint
ALTER TABLE "vm" RENAME COLUMN "monitor_info" TO "probe_info";--> statement-breakpoint
ALTER TABLE "vm" ADD COLUMN "probe_config" jsonb;--> statement-breakpoint
ALTER TABLE "vm" ADD CONSTRAINT "vm_probe_token_unique" UNIQUE("probe_token");