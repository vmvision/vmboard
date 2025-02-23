import { decimal, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { pgTable } from "../utils";
import { vm } from "./vm";

export const analysis = pgTable("analysis", {
  id: serial("id").primaryKey(),

  vmId: varchar("vm_id")
    .notNull()
    .references(() => vm.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),

  cpuUsage: decimal("cpu_usage", { precision: 16, scale: 15 }).notNull(),

  memoryUsage: decimal("memory_usage").notNull(),
  memoryTotal: decimal("memory_total").notNull(),

  diskWrite: decimal("disk_write").notNull(),
  diskRead: decimal("disk_read").notNull(),

  networkIn: decimal("network_in").notNull(),
  networkOut: decimal("network_out").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
