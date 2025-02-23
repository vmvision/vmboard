import { and, eq } from "drizzle-orm";
import appFactory from "../factory";
import { merchant as merchantTable } from "@/db/schema/merchant";
import DMIT from "vmapi/dmit";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = appFactory.createApp().get(
  "/:id/list-vms",
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

    const merchant = await db.query.merchant.findFirst({
      where: and(
        eq(merchantTable.id, input.id),
        eq(merchantTable.userId, user.id),
      ),
    });

    if (!merchant) {
      throw new Error("Merchant not found");
    }

    if (merchant.merchant !== "dmit") {
      throw new Error("Merchant not support now");
    }

    const dmit = new DMIT();
    if (!merchant.cookieJar) {
      await dmit.login(merchant.username, merchant.password);
      const cookieJar = await dmit.exportCookie();
      await db
        .update(merchantTable)
        .set({
          cookieJar,
        })
        .where(eq(merchantTable.id, merchant.id));
    } else {
      await dmit.importCookie(merchant.cookieJar);
    }
    
    const vms = await dmit.listVM();
    return c.json(vms);
  },
);

export default app;
