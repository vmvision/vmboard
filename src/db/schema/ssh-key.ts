import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const sshKeysTable = pgTable("ssh-key", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),

  name: text("name").notNull(),
  description: text("description"),

  privateKey: text("privateKey").notNull().default(""),
  publicKey: text("publicKey").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type SSHKey = typeof sshKeysTable.$inferSelect;
export type NewSSHKey = typeof sshKeysTable.$inferInsert;
