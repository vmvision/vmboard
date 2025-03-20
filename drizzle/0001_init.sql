CREATE TABLE "ssh-key" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"privateKey" text DEFAULT '' NOT NULL,
	"publicKey" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"handle" varchar(255),
	"hostname" varchar(255),
	"title" text DEFAULT 'VMboard' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_vm" (
	"page_id" integer NOT NULL,
	"vm_id" integer NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"nickname" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_vm_page_id_vm_id_pk" PRIMARY KEY("page_id","vm_id")
);
--> statement-breakpoint
ALTER TABLE "merchant" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "merchant" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "vm" ALTER COLUMN "merchant_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vm" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "merchant" ADD COLUMN "cookie_jar" jsonb;--> statement-breakpoint
ALTER TABLE "vm" ADD COLUMN "token" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "vm" ADD COLUMN "monitor_info" jsonb;--> statement-breakpoint
ALTER TABLE "ssh-key" ADD CONSTRAINT "ssh-key_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "page_vm" ADD CONSTRAINT "page_vm_page_id_page_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."page"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "page_vm" ADD CONSTRAINT "page_vm_vm_id_vm_id_fk" FOREIGN KEY ("vm_id") REFERENCES "public"."vm"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
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