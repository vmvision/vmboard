import { decimal, integer, timestamp } from "drizzle-orm/pg-core";
import { pgTable } from "../utils";
import { vm } from "./vm";

export const monitor = pgTable("monitor", {
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

  memoryUsed: decimal("memory_used").notNull(),
  memoryTotal: decimal("memory_total").notNull(),

  diskUsed: decimal("disk_used").notNull(),
  diskTotal: decimal("disk_total").notNull(),

  networkIn: decimal("network_in").notNull(),
  networkOut: decimal("network_out").notNull(),

  tcpConnections: integer("tcp_connections").notNull(),
  udpConnections: integer("udp_connections").notNull(),
});

export type Monitor = typeof monitor.$inferSelect;
export type NewMonitor = typeof monitor.$inferInsert;
