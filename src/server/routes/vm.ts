import { and, eq } from "drizzle-orm";
import appFactory from "../factory";
import { vm as vmsTable } from "@/db/schema/vm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { broadcastToVms, checkVmSocket } from "../monitor/socket";

const app = appFactory
  .createApp()
  .get(
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
        sshInfo: vm.sshInfo,
      });
    },
  )
  .get(
    "/:id/monitor",
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
      if (!vm.monitorInfo) {
        broadcastToVms([vm.id], {
          type: "get_info",
          data: {},
        });
      }
      return c.json({
        name: vm.nickname,
        monitorInfo: vm.monitorInfo,
      });
    },
  )
  .get(
    "/:id/monitor/status",
    zValidator(
      "param",
      z.object({
        id: z.coerce.number(),
      }),
    ),
    async (c) => {
      const input = c.req.valid("param");
      return c.json({
        status: checkVmSocket(input.id),
      });
    },
  );

export default app;
