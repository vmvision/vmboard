import { Hono } from "hono";
import { auth } from "@/lib/auth";
import db from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

app.post("/update-user", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  const formData = await c.req.formData();
  const userId = formData.get("userId") as string;
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;

  if (!userId || userId !== session.user.id) {
    return c.json({ success: false, error: "Invalid user ID" }, 403);
  }
  if (!name) {
    return c.json({ success: false, error: "Name is required" }, 400);
  }

  try {
    await db
      .update(user)
      .set({
        name,
        username: username || null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    return c.json({ success: true }, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

export default app;