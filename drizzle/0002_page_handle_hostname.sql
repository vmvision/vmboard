CREATE TABLE "hostname" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"hostname" varchar(255) NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_bind" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_id" integer NOT NULL,
	"handle" varchar(255),
	"hostname_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "page_handle_idx";--> statement-breakpoint
DROP INDEX "page_hostname_idx";--> statement-breakpoint
ALTER TABLE "page_bind" ADD CONSTRAINT "page_bind_page_id_page_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."page"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_bind" ADD CONSTRAINT "page_bind_hostname_id_hostname_id_fk" FOREIGN KEY ("hostname_id") REFERENCES "public"."hostname"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "page_bind_handle_hostname_idx" ON "page_bind" USING btree (lower("handle"),"hostname_id");--> statement-breakpoint
ALTER TABLE "page" DROP COLUMN "handle";--> statement-breakpoint
ALTER TABLE "page" DROP COLUMN "hostname";