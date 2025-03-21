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
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { vm } from "./vm";
import { user } from "./auth";
import { z } from "zod";

export const handleSchema = z
  .string()
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
  });

export const page = pgTable("page", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),

  title: text("title").default("VMboard").notNull(),
  description: text("description").default("").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const pageRelations = relations(page, ({ many, one }) => ({
  user: one(user, {
    fields: [page.userId],
    references: [user.id],
  }),
  pageVMs: many(pageVM),
  pageBind: one(pageBind, {
    fields: [page.id],
    references: [pageBind.pageId],
  }),
}));

export type Page = typeof page.$inferSelect;
export type NewPage = typeof page.$inferInsert;
export const createPageSchema = createInsertSchema(page, {
  title: (schema) => schema.min(1),
}).pick({
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

export const hostnameSchema = z
  .string()
  .min(1)
  .max(35)
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
  );

export const hostname = pgTable("hostname", {
  id: serial("id").primaryKey(),

  userId: varchar("user_id", { length: 255 }).notNull(),
  hostname: varchar("hostname", { length: 255 }).notNull(),

  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const hostnameRelations = relations(hostname, ({ one }) => ({
  user: one(user, {
    fields: [hostname.userId],
    references: [user.id],
  }),
  pageBind: one(pageBind, {
    fields: [hostname.id],
    references: [pageBind.hostnameId],
  }),
}));

export const pageBind = pgTable(
  "page_bind",
  {
    id: serial("id").primaryKey(),

    pageId: integer("page_id")
      .references(() => page.id)
      .notNull(),

    handle: varchar("handle", { length: 255 }),
    hostnameId: integer("hostname_id").references(() => hostname.id),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("page_bind_handle_hostname_idx").on(
      sql`lower(${t.handle})`,
      t.hostnameId,
    ),
  ],
);

export type PageBind = typeof pageBind.$inferSelect;

export const pageBindRelations = relations(pageBind, ({ one }) => ({
  page: one(page, {
    fields: [pageBind.pageId],
    references: [page.id],
  }),
  hostname: one(hostname, {
    fields: [pageBind.hostnameId],
    references: [hostname.id],
  }),
}));
