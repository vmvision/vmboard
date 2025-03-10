import { decimal, integer, timestamp } from "drizzle-orm/pg-core";
import { pgTable } from "../utils";
import { vm } from "./vm";

export const metrics = pgTable("metrics", {
  time: timestamp("time", { withTimezone: true }).defaultNow().notNull(),
  vmId: integer("vm_id")
    .references(() => vm.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  uptime: integer("uptime").notNull(),

  cpuUsage: decimal("cpu_usage").notNull(),
  processCount: integer("process_count").notNull(),

  // Windows may not have load average
  load1: decimal("load1"),
  load5: decimal("load5"),
  load15: decimal("load15"),

  memoryUsed: decimal("memory_used").notNull(),
  memoryTotal: decimal("memory_total").notNull(),

  diskUsed: decimal("disk_used").notNull(),
  diskTotal: decimal("disk_total").notNull(),

  networkIn: decimal("network_in").notNull(),
  networkOut: decimal("network_out").notNull(),

  tcpConnections: integer("tcp_connections").notNull(),
  udpConnections: integer("udp_connections").notNull(),
});

export type Metrics = typeof metrics.$inferSelect;
export type NewMetrics = typeof metrics.$inferInsert;
