import {
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const merchant = pgTable("merchant", {
  id: serial("id").primaryKey(),
  nickname: varchar("nickname").notNull(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  merchant: varchar("merchant", {
    length: 30,
  }).notNull(),

  username: varchar("username").notNull(),
  password: varchar("password").notNull(),
  cookieJar: jsonb("cookie_jar"),
  comment: text("comment"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Merchant = typeof merchant.$inferSelect;
export type NewMerchant = typeof merchant.$inferInsert;
