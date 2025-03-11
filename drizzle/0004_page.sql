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
ALTER TABLE "monitor" RENAME TO "metrics";--> statement-breakpoint
ALTER TABLE "metrics" DROP CONSTRAINT "monitor_vm_id_vm_id_fk";
--> statement-breakpoint
ALTER TABLE "vm" ADD COLUMN "monitor_info" jsonb;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "load1" numeric;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "load5" numeric;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "load15" numeric;--> statement-breakpoint
ALTER TABLE "page" ADD CONSTRAINT "page_alias_id_page_handle_fk" FOREIGN KEY ("alias_id") REFERENCES "public"."page"("handle") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "page_handle_idx" ON "page" USING btree (lower("handle"));--> statement-breakpoint
CREATE UNIQUE INDEX "page_hostname_idx" ON "page" USING btree (lower("hostname"));--> statement-breakpoint
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_vm_id_vm_id_fk" FOREIGN KEY ("vm_id") REFERENCES "public"."vm"("id") ON DELETE cascade ON UPDATE cascade;