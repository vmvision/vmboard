ALTER TABLE "vm" ADD COLUMN "token" uuid DEFAULT gen_random_uuid() NOT NULL;
--> statement-breakpoint
CREATE TABLE "monitor" (
	"time" timestamp with time zone DEFAULT now() NOT NULL,
	"vm_id" integer NOT NULL,
	"uptime" integer NOT NULL,
	"cpu_usage" numeric NOT NULL,
	"process_count" integer NOT NULL,
	"memory_used" numeric NOT NULL,
	"memory_total" numeric NOT NULL,
	"disk_used" numeric NOT NULL,
	"disk_total" numeric NOT NULL,
	"network_in" numeric NOT NULL,
	"network_out" numeric NOT NULL,
	"tcp_connections" integer NOT NULL,
	"udp_connections" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "monitor" ADD CONSTRAINT "monitor_vm_id_vm_id_fk" FOREIGN KEY ("vm_id") REFERENCES "public"."vm"("id") ON DELETE cascade ON UPDATE cascade;
--> statement-breakpoint
SELECT create_hypertable('monitor', 'time');
SELECT add_retention_policy('monitor', INTERVAL '7 days');
ALTER TABLE "monitor" SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'vm_id',
	timescaledb.compress_orderby='time'
);
SELECT add_compression_policy('monitor', INTERVAL '1 days');
