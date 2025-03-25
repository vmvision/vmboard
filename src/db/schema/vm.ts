import {
  inet,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { merchant, type Merchant } from "./merchant";
import type { VMMetadata } from "vmapi";
import type { ConnectConfig } from "ssh2";
import bigintJsonb from "../bigint-jsonb";
import { relations } from "drizzle-orm";
import { pageVM } from "./page";
import { metrics } from "./metrics";
import { z } from "zod";

export interface SSHInfo extends ConnectConfig {
  sshKeyId?: number;
}

export interface MonitorVMInfo {
  os: string;
  osVersion: string;
  arch: string;
  platform: string;
  platformVersion: string;
  kernel: string;
  hostname: string;
  cpu: string[];
  memory: string;
  disk: string;
  uptime: string;
  version: string;
}

export const monitorConfig = z.object({
  metrics_interval: z.number().min(1).max(60),
});

export type MonitorConfig = z.infer<typeof monitorConfig>;

export const vm = pgTable("vm", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  merchantId: integer("merchant_id").references(() => merchant.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),

  nickname: varchar("nickname", { length: 128 }).notNull(),
  status: varchar("status", {
    length: 30,
    enum: ["running", "stopped", "expired", "error"],
  }).notNull(),
  ipAddress: inet("ip_address"),
  metadata: jsonb("metadata").$type<VMMetadata>(),

  sshInfo: jsonb("ssh_info").$type<SSHInfo>(),
  /* Secret token for probe */
  probeToken: uuid("probe_token").defaultRandom().unique().notNull(),
  /* Config for probe */
  probeConfig: jsonb("probe_config").$type<MonitorConfig>(),
  /* Information harvest from probe */
  probeInfo: bigintJsonb("probe_info").$type<MonitorVMInfo>(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const vmRelations = relations(vm, ({ one, many }) => ({
  user: one(user, {
    fields: [vm.userId],
    references: [user.id],
  }),
  merchant: one(merchant, {
    fields: [vm.merchantId],
    references: [merchant.id],
  }),
  pages: many(pageVM),
  metrics: many(metrics),
}));

export type VM = typeof vm.$inferSelect;
export type NewVM = typeof vm.$inferInsert;
export type VMWithMerchant = VM & {
  merchant: Merchant;
};
