CREATE TABLE "metrics" (
	"time" timestamp with time zone DEFAULT now() NOT NULL,
	"vm_id" integer NOT NULL,
	"uptime" integer NOT NULL,
	"cpu_usage" numeric NOT NULL,
	"process_count" integer NOT NULL,
	"load1" numeric,
	"load5" numeric,
	"load15" numeric,
	"memory_used" numeric NOT NULL,
	"memory_total" numeric NOT NULL,
	"swap_used" numeric NOT NULL,
	"swap_total" numeric NOT NULL,
	"disk_used" numeric NOT NULL,
	"disk_total" numeric NOT NULL,
	"disk_read" numeric NOT NULL,
	"disk_write" numeric NOT NULL,
	"network_in" numeric NOT NULL,
	"network_out" numeric NOT NULL,
	"tcp_connections" integer NOT NULL,
	"udp_connections" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page" (
	"handle" varchar(255) PRIMARY KEY NOT NULL,
	"alias_id" varchar(255),
	"hostname" varchar(255),
	"user_id" varchar(255) NOT NULL,
	"title" text DEFAULT 'VMboard' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"vm_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vm" ALTER COLUMN "merchant_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vm" ADD COLUMN "token" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "vm" ADD COLUMN "monitor_info" jsonb;--> statement-breakpoint
ALTER TABLE "page" ADD CONSTRAINT "page_alias_id_page_handle_fk" FOREIGN KEY ("alias_id") REFERENCES "public"."page"("handle") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "page_handle_idx" ON "page" USING btree (lower("handle"));--> statement-breakpoint
CREATE UNIQUE INDEX "page_hostname_idx" ON "page" USING btree (lower("hostname"));
--> statement-breakpoint
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_vm_id_vm_id_fk" FOREIGN KEY ("vm_id") REFERENCES "public"."vm"("id") ON DELETE cascade ON UPDATE cascade;
--> statement-breakpoint
SELECT create_hypertable('metrics', 'time');
SELECT add_retention_policy('metrics', INTERVAL '7 days');
ALTER TABLE "metrics" SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'vm_id',
	timescaledb.compress_orderby='time'
);
SELECT add_compression_policy('metrics', INTERVAL '1 days');