import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  jsonb,
  varchar,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const page = pgTable(
  "page",
  {
    handle: varchar("handle", { length: 255 }).primaryKey(),
    aliasId: varchar("alias_id", { length: 255 }).references(
      (): AnyPgColumn => page.handle,
      {
        onUpdate: "cascade",
        onDelete: "set null",
      },
    ),
    hostname: varchar("hostname", { length: 255 }),
    userId: varchar("user_id", { length: 255 }).notNull(),

    title: text("title").default("VMboard").notNull(),
    description: text("description").default("").notNull(),

    vmIds: jsonb("vm_ids").$type<number[]>().notNull().default([]),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("page_handle_idx").on(sql`lower(t.handle)`),
    uniqueIndex("page_hostname_idx").on(sql`lower(t.hostname)`),
  ],
);
