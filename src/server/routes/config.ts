// src/server/routes/config.ts
import { z } from "zod";
import db from "@/db";
import { config, systemSettingsSchema, CONFIG_KEYS, SystemSettings } from "@/db/schema/config";
import { generateWindowConfig } from "@/db/schema/config"; // Separate import to avoid naming conflict
import { and, eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import appFactory from "../factory";
import BizError, { BizCodeEnum } from "../error";
import { roleGuard } from "../middleware/auth";

// Define validation schemas
const configQuerySchema = z.object({
  isGlobal: z.boolean().optional().default(false),
});

// Use partial update (if deep partial update is needed, install zod-extensions or implement custom solution)
const configUpdateSchema = systemSettingsSchema.partial();

const app = appFactory
  .createApp()
  // Get configuration
  .get(
    "/",
    roleGuard(["user", "admin"]),
    zValidator("query", configQuerySchema),
    async (c) => {
      const { isGlobal } = c.req.valid("query");
      const user = c.get("user");

      // If it's a global configuration, admin privileges are required
      if (isGlobal && user.role !== "admin") {
        // Return permission error with 403 status code instead of throwing an error
        return c.json({ error: "Permission denied" }, 403);
      }

      // Query condition
      const condition = buildCondition(user, isGlobal);

      // Query configuration
      const result = await findConfig(user, isGlobal);

      // If configuration is found, return it; otherwise return default configuration
      if (result) {
        return c.json(systemSettingsSchema.parse(result.value));
      }

      return c.json(systemSettingsSchema.parse({}));
    }
  )
  // Update configuration
  .post(
    "/",
    roleGuard(["user", "admin"]),
    zValidator("query", configQuerySchema),
    zValidator("json", configUpdateSchema),
    async (c) => {
      const { isGlobal } = c.req.valid("query");
      const body = c.req.valid("json");
      const user = c.get("user");

      // If it's a global configuration, admin privileges are required
      if (isGlobal && user.role !== "admin") {
        // Return permission error with 403 status code instead of throwing an error
        return c.json({ error: "Permission denied" }, 403);
      }

      // Query condition
      const condition = buildCondition(user, isGlobal);

      // Query existing configuration
      const existingConfig = await findConfig(user, isGlobal);

      // Merge configuration
      const mergedConfig = existingConfig
        ? { ...systemSettingsSchema.parse(existingConfig.value), ...body }
        : { ...systemSettingsSchema.parse({}), ...body };

      // Insert or update configuration
      await db
        .insert(config)
        .values({
          key: CONFIG_KEYS.SYSTEM_SETTINGS,
          value: mergedConfig,
          userId: user.id,
          isGlobal: isGlobal,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [config.key, config.userId, config.isGlobal],
          set: {
            value: mergedConfig,
            updatedAt: new Date(),
          },
        });

      return c.json({ success: true, config: mergedConfig });
    }
  )
  // Get window configuration
  .get(
    "/window",
    roleGuard(["user"]),
    async (c) => {
      const user = c.get("user");

      // Query user configuration
      const result = await findConfig(user, false);

      // If user configuration is not found, try to get global configuration
      if (!result) {
        const globalResult = await findConfig(null, true);

        if (globalResult) {
          const settings = systemSettingsSchema.parse(globalResult.value);
          // Use generateWindowConfig helper function
          return c.json(generateWindowConfig(settings));
        }
      } else {
        const settings = systemSettingsSchema.parse(result.value);
        // Use generateWindowConfig helper function
        return c.json(generateWindowConfig(settings));
      }

      // Return default configuration
      const defaultSettings = systemSettingsSchema.parse({});
      return c.json(generateWindowConfig(defaultSettings));
    }
  )
  // Reset configuration
  .delete(
    "/",
    roleGuard(["user", "admin"]),
    zValidator("query", configQuerySchema),
    async (c) => {
      const { isGlobal } = c.req.valid("query");
      const user = c.get("user");

      // If it's a global configuration, admin privileges are required
      if (isGlobal && user.role !== "admin") {
        // Return permission error with 403 status code instead of throwing an error
        return c.json({ error: "Permission denied" }, 403);
      }

      // Query condition
      const condition = buildCondition(user, isGlobal);

      // Delete configuration
      await db.delete(config).where(condition);

      return c.json({ success: true });
    }
  );

export default app;

function buildCondition(
  user: { id: string; role?: string | null } | null, 
  isGlobal: boolean
) {
  return isGlobal
    ? and(eq(config.key, CONFIG_KEYS.SYSTEM_SETTINGS), eq(config.isGlobal, true))
    : and(eq(config.key, CONFIG_KEYS.SYSTEM_SETTINGS), eq(config.userId, user?.id ?? ''));
}

async function findConfig(
  user: { id: string; role?: string | null } | null, 
  isGlobal: boolean
) {
  const condition = buildCondition(user, isGlobal);
  return await db.select().from(config).where(condition).limit(1).then(rows => rows[0] || null);
}