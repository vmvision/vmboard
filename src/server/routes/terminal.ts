import { and, eq } from "drizzle-orm";
import appFactory from "../factory";
import { vm as vmsTable } from "@/db/schema/vm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = appFactory.createApp().get(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.coerce.number(),
    }),
  ),
  async (c) => {
    const input = c.req.valid("param");
    const db = c.get("db");
    const user = c.get("user");

    const vm = await db.query.vm.findFirst({
      where: and(eq(vmsTable.id, input.id), eq(vmsTable.userId, user.id)),
    });

    if (!vm) {
      throw new Error("VM not found");
    }

    return c.json({
      name: vm.nickname,
    });
  },
);

export default app;
