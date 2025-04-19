import {
  pgTable,
  boolean,
  varchar,
  jsonb,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { z } from "zod";

// System Settings Schema
export const systemSettingsSchema = z.object({
  // Basic System Settings
  system: z.object({
    siteName: z.string().default("VMboard"),         // Site Name
    language: z.string().default("zh-CN"),           // Language Setting
    customCode: z.string().default(""),              // Custom Code
  }),
  
  // User Frontend Settings
  userFrontend: z.object({
    customBackgroundImage: z.string().optional(),    // Custom Background Image
    customMobileBackgroundImage: z.string().optional(), // Custom Mobile Background Image
    customLogo: z.string().optional(),               // Custom Logo URL
    customDesc: z.string().optional(),               // Custom Description
    showNetTransfer: z.boolean().default(true),      // Whether to Show Network Transfer
    disableAnimatedMan: z.boolean().default(false),  // Enable/Disable Animated Character Illustration
    customIllustration: z.string().optional(),       // Custom Illustration
    fixedTopServerName: z.boolean().default(true),   // Whether to Fix Server Name at Top
    customLinks: z.string().default("[]"),           // Custom External Links, JSON Format
    forceTheme: z.enum(["light", "dark", ""]).default(""), // Force Default Color Theme
    forceUseSvgFlag: z.boolean().default(false),     // Whether to Force Use SVG Flags
  }),
  
  // Admin Frontend Settings
  adminFrontend: z.object({
    disableAnimatedMan: z.boolean().default(false),  // Enable/Disable Animated Character Illustration
    agentConnectionAddress: z.string().optional(),   // Agent Connection Address
  }),
  
  // DDNS Settings
  ddns: z.object({
    customPublicDNS: z.string().optional(),          // DDNS Custom Public DNS Name Server
  }),
  
  // IP Settings
  ip: z.object({
    frontendRealIPHeader: z.string().default("CF-Connecting-IP"), // Frontend Real IP Header
    agentRealIPHeader: z.string().default("CF-Connecting-IP"),    // Agent Real IP Header
  }),
  
  // Monitor Style (Merged into userFrontend fields)
  monitor: z.object({
    showIpInfo: z.boolean().default(true),           // Show IP Information
    showFlag: z.boolean().default(true),             // Show Flag
    refreshInterval: z.number().int().positive().default(3000), // Refresh Interval
  }),
});

// Export Type
export type SystemSettings = z.infer<typeof systemSettingsSchema>;

// Define Configuration Keys
export const CONFIG_KEYS = {
  SYSTEM_SETTINGS: "system_settings",
} as const;

// Database Table Definition
export const config = pgTable("config", {
  key: varchar("key", { length: 255 }),
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
}, (table) => ({
  pk: primaryKey({ columns: [table.key, table.userId, table.isGlobal] })
}));

// Helper function to create window config object
export function generateWindowConfig(settings: SystemSettings): Record<string, any> {
  const { userFrontend } = settings;
  
  return {
    CustomBackgroundImage: userFrontend.customBackgroundImage,
    CustomMobileBackgroundImage: userFrontend.customMobileBackgroundImage,
    CustomLogo: userFrontend.customLogo,
    CustomDesc: userFrontend.customDesc,
    ShowNetTransfer: userFrontend.showNetTransfer,
    DisableAnimatedMan: userFrontend.disableAnimatedMan,
    CustomIllustration: userFrontend.customIllustration,
    FixedTopServerName: userFrontend.fixedTopServerName,
    CustomLinks: JSON.parse(userFrontend.customLinks || "[]"),
    ForceTheme: userFrontend.forceTheme || undefined,
    ForceUseSvgFlag: userFrontend.forceUseSvgFlag,
  };
}
