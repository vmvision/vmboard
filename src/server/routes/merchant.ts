import { and, desc, eq } from "drizzle-orm";
import appFactory from "../factory";
import { merchant as merchantTable } from "@/db/schema/merchant";
import vmAPI from "vmapi";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { headers } from "next/headers";

const app = appFactory
  .createApp()
  .get("/list", async (c) => {
    const db = c.get("db");
    const user = c.get("user");

    const merchants = await db.query.merchant.findMany({
      where: eq(merchantTable.userId, user.id),
      columns: {
        id: true,
        nickname: true,
        username: true,
      },
      orderBy: [desc(merchantTable.createdAt)],
    });

    return c.json(merchants);
  })
  .get(
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
          // eq(merchantTable.userId, user.id),
        ),
      });

      if (!merchant) {
        throw new Error("Merchant not found");
      }

      const vmapi = vmAPI(merchant.merchant, {
        account: {
          username: merchant.username,
          password: merchant.password,
        },
        headers: {},
        cookieJar: merchant.cookieJar,
      });
      if (!vmapi) {
        throw new Error("Merchant not support now");
      }
      // if (!merchant.cookieJar) {
      //   await vmapi.login(merchant.username, merchant.password);
      //   const cookieJar = await vmapi.exportCookie();
      //   await db
      //     .update(merchantTable)
      //     .set({
      //       cookieJar,
      //     })
      //     .where(eq(merchantTable.id, merchant.id));
      // } else {
      //   await vmapi.importCookie(merchant.cookieJar);
      // }

      const vms = await vmapi.getVMList();
      console.log(vms);
      return c.json(vms);
    },
  );

export default app;
