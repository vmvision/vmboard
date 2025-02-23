import {
  inet,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { merchant, type Merchant } from "./merchant";
import type { VMMetadata } from "vmapi";
import type { ConnectConfig } from "ssh2";

export const vm = pgTable("vm", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  merchantId: integer("merchant_id")
    .notNull()
    .references(() => merchant.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),

  nickname: varchar("nickname", { length: 128 }).notNull(),
  status: varchar("status", {
    length: 30,
    enum: ["running", "stopped", "expired", "error"],
  }).notNull(),
  ipAddress: inet("ip_address"),
  sshInfo: jsonb("ssh_info").$type<ConnectConfig>(),
  metadata: jsonb("metadata").$type<VMMetadata>(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});

export type VM = typeof vm.$inferSelect;
export type NewVM = typeof vm.$inferInsert;
export type VMWithMerchant = VM & {
  merchant: Merchant;
};
