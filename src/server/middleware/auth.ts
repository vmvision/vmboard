import type { Env } from "../factory";
import { auth } from "@/lib/auth";
import { createMiddleware } from "hono/factory";

export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

export const roleGuard = (role: "user" | "admin") =>
  createMiddleware<Env>(async (c, next) => {
    const user = c.get("user");

    if (role !== user.role) {
      return c.json({ error: "Forbidden" }, 403);
    }

    return next();
  });
