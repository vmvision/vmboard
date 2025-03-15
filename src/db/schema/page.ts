import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  jsonb,
  varchar,
  uniqueIndex,
  type AnyPgColumn,
  serial,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { vm } from "./vm";
import { user } from "./auth";

export const page = pgTable(
  "page",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),

    handle: varchar("handle", { length: 255 }),
    hostname: varchar("hostname", { length: 255 }),

    title: text("title").default("VMboard").notNull(),
    description: text("description").default("").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("page_handle_idx").on(sql`lower(${t.handle})`),
    uniqueIndex("page_hostname_idx").on(sql`lower(${t.hostname})`),
  ],
);

export const pageRelations = relations(page, ({ many, one }) => ({
  user: one(user, {
    fields: [page.userId],
    references: [user.id],
  }),
  vms: many(pageVM),
}));

export type Page = typeof page.$inferSelect;
export type NewPage = typeof page.$inferInsert;
export const createPageSchema = createInsertSchema(page, {
  handle: (schema) =>
    schema
      .min(1)
      .max(255)
      .refine((value) => /^[a-zA-Z0-9]/.test(value), {
        message: "Handle must start with a letter or number",
      })
      .refine((value) => /^[a-zA-Z0-9-]+$/.test(value), {
        message: "Handle can only contain letters, numbers, and hyphens",
      })
      .refine((value) => !/--/.test(value), {
        message: "Handle cannot contain consecutive hyphens",
      })
      .refine((value) => !/-$/.test(value), {
        message: "Handle cannot end with a hyphen",
      }),
  hostname: (schema) =>
    schema
      .min(1)
      .max(255)
      .refine(
        (value) => {
          const parts = value.split(".");
          return parts.length >= 2; // 至少包含一个点
        },
        { message: "Hostname must contain at least one dot" },
      )
      .refine(
        (value) => {
          return /^[A-Za-z0-9]/.test(value); // 必须以字母或数字开头
        },
        { message: "Hostname must start with letter or number" },
      )
      .refine(
        (value) => {
          return /[A-Za-z0-9]$/.test(value); // 必须以字母或数字结尾
        },
        { message: "Hostname must end with letter or number" },
      ),
  title: (schema) => schema.min(1),
}).pick({
  handle: true,
  hostname: true,
  title: true,
  description: true,
});
export const updatePageSchema = createPageSchema;

export const pageVM = pgTable(
  "page_vm",
  {
    pageId: integer("page_id")
      .references(() => page.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    vmId: integer("vm_id")
      .references(() => vm.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    order: integer("order").notNull().default(0),
    nickname: varchar("nickname", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.pageId, t.vmId] })],
);

export const pageVMRelations = relations(pageVM, ({ one }) => ({
  page: one(page, {
    fields: [pageVM.pageId],
    references: [page.id],
  }),
  vm: one(vm, {
    fields: [pageVM.vmId],
    references: [vm.id],
  }),
}));

export const createPageVMSchema = createInsertSchema(pageVM);
export const updatePageVMSchema = createPageVMSchema.pick({
  order: true,
  nickname: true,
});
