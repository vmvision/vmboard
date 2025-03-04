import {
  pgTable,
  boolean,
  varchar,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const config = pgTable("config", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: jsonb("value").notNull(),
  isGlobal: boolean("is_global").default(false),

  userId: varchar("user_id", { length: 255 })
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
