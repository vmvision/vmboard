import { and, asc, desc, eq } from "drizzle-orm";
import appFactory from "../factory";
import { vm as vmsTable } from "@/db/schema/vm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { vmManager } from "../wss/manager/vm-manager";
import BizError, { BizCodeEnum } from "../error";
import { metrics as metricsTable } from "@/db/schema/metrics";
import { roleGuard } from "../middleware/auth";

const app = appFactory
  .createApp()
  //get all vms
  .get("/", roleGuard(["user", "admin"]), async (c) => {
    const db = c.get("db");
    const user = c.get("user");

    const vms = await db.query.vm.findMany({
      where: eq(vmsTable.userId, user.id),
    });

    return c.json(vms);
  })
  // get all server status
  .get("/status", roleGuard(["user", "admin"]), async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const vms = await db.query.vm.findMany({
      where: eq(vmsTable.userId, user.id),
      columns: {
        id: true,
      },
    });
    const status = vms.map((vm) => ({
      id: vm.id,
      status: vmManager.checkSocket(vm.id),
    }));
    return c.json({
      total: vms.length,
      online: status.filter((s) => s.status).length,
      offline: status.filter((s) => !s.status).length,
    });
  })
  //get vm by id
  .get(
    "/:id",
    roleGuard(["user", "admin"]),
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
        throw new BizError(BizCodeEnum.VMNotFound);
      }

      return c.json({
        name: vm.nickname,
        sshInfo: vm.sshInfo,
      });
    },
  )
  //get vm monitor info
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
        throw new BizError(BizCodeEnum.VMNotFound);
      }
      if (!vm.monitorInfo) {
        vmManager.broadcast(vm.id, {
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
  //get vm monitor status
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
        status: vmManager.checkSocket(input.id),
      });
    },
  )
  .get(
    "/:id/monitor/metrics",
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
        throw new BizError(BizCodeEnum.VMNotFound);
      }
      const metrics = await db.query.metrics.findMany({
        where: eq(metricsTable.vmId, vm.id),
        limit: 20,
        orderBy: desc(metricsTable.time),
      });
      return c.json(metrics.reverse());
    },
  )
  //update vm nickname
  .put(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.coerce.number(),
      }),
    ),
    zValidator("json", z.object({ nickname: z.string() })),
    async (c) => {
      const input = c.req.valid("param");
      const body = c.req.valid("json");
      const db = c.get("db");
      const user = c.get("user");
      await db
        .update(vmsTable)
        .set({ nickname: body.nickname })
        .where(and(eq(vmsTable.id, input.id), eq(vmsTable.userId, user.id)));

      return c.json({
        message: "VM nickname updated",
      });
    },
  );

export default app;
