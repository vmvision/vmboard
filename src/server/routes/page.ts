import { z } from "zod";
import db from "@/db";
import {
  createPageSchema,
  createPageVMSchema,
  type Page,
  type PageBind,
  page as pageTable,
  updatePageSchema,
  updatePageVMSchema,
} from "@/db/schema/page";
import {
  pageVM as pageVMTable,
  hostname as hostnameTable,
} from "@/db/schema/page";
import { metrics, metrics as metricsTable } from "@/db/schema/metrics";
import { pageBind as pageBindTable } from "@/db/schema/page";
import { and, count, desc, eq, gt, inArray, sql, sum } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import appFactory from "../factory";
import BizError, { BizCodeEnum } from "../error";
import { describeRoute } from "hono-openapi";
import { vmManager } from "../wss/manager/vm-manager";
import { roleGuard } from "../middleware/auth";

const app = appFactory
  .createApp()
  // Get all pages for the current user
  .get("/", roleGuard(["user"]), async (c) => {
    const user = c.get("user");

    const rows = await db
      .select({
        id: pageTable.id,
        title: pageTable.title,
        description: pageTable.description,
        bind: pageBindTable,
        vmCount: count(pageVMTable.vmId),
        createdAt: pageTable.createdAt,
      })
      .from(pageTable)
      .where(eq(pageTable.userId, user.id))
      .leftJoin(pageVMTable, eq(pageTable.id, pageVMTable.pageId))
      .leftJoin(pageBindTable, eq(pageTable.id, pageBindTable.pageId))
      .groupBy(pageTable.id, pageTable.title, pageBindTable.id)
      .orderBy(pageTable.updatedAt);
    const results = Object.values(
      rows.reduce<
        Record<
          number,
          Pick<Page, "id" | "title" | "description"> & {
            binds: PageBind[];
            vmCount: number;
            createdAt: Date;
          }
        >
      >((acc, row) => {
        const bind = row.bind;
        if (!acc[row.id]) {
          acc[row.id] = {
            id: row.id,
            title: row.title,
            description: row.description,
            binds: bind ? [bind] : [],
            vmCount: Number(row.vmCount),
            createdAt: row.createdAt,
          };
        } else if (bind) {
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          acc[row.id]!.binds.push(bind);
        }
        return acc;
      }, {}),
    );

    return c.json(results);
  })
  .get(
    "/bind",
    describeRoute({
      description: "Get page binding",
      responses: {
        // 200: {
        //   description: 'Successful response',
        //   content: {
        //     'text/plain': { schema: resolver(responseSchema) },
        //   },
        // },
      },
    }),
    zValidator(
      "query",
      z
        .object({
          handle: z.string(),
          hostname: z.string().nullable(),
        })
        .partial(),
    ),
    async (c) => {
      const input = c.req.valid("query");

      const hostname = input?.hostname
        ? await db.query.hostname.findFirst({
            where: eq(hostnameTable.hostname, input.hostname),
          })
        : undefined;
      if (input.hostname && hostname == null) {
        throw new BizError(BizCodeEnum.HostnameNotFound);
      }

      const bind = await db.query.pageBind.findFirst({
        where: input?.handle
          ? hostname
            ? and(
                eq(pageBindTable.handle, input.handle),
                eq(pageBindTable.hostnameId, hostname.id),
              )
            : eq(pageBindTable.handle, input.handle)
          : hostname
            ? eq(pageBindTable.hostnameId, hostname.id)
            : (() => {
                throw new BizError(BizCodeEnum.HostnameNotFound);
              })(),
        with: {
          page: {
            with: {
              pageVMs: {
                with: {
                  vm: true,
                },
              },
            },
          },
        },
      });
      if (!bind) {
        throw new BizError(BizCodeEnum.PageNotFound);
      }
      return c.json({
        id: bind.page.id,
        title: bind.page.title,
        description: bind.page.description,
        vms: bind.page.pageVMs.map((pageVM) => ({
          ...pageVM.vm,
          nickname: pageVM.nickname || pageVM.vm.nickname,
        })),
      });
    },
  )
  // Get a specific page by handle
  .get(
    "/:id",
    roleGuard(["user"]),
    zValidator(
      "param",
      z.object({
        id: z.coerce.number(),
      }),
    ),
    async (c) => {
      const input = c.req.valid("param");
      const user = c.get("user");

      const page = await db.query.page.findFirst({
        where: eq(pageTable.id, input.id),
        with: {
          pageVMs: {
            with: {
              vm: true,
            },
          },
        },
      });

      if (!page || page.userId !== user.id) {
        throw new BizError(BizCodeEnum.PageNotFound);
      }

      return c.json(page);
    },
  )
  .get(
    "/:id/status",
    zValidator(
      "param",
      z.object({
        id: z.coerce.number(),
      }),
    ),
    async (c) => {
      const input = c.req.valid("param");

      const page = await db.query.page.findFirst({
        where: eq(pageTable.id, input.id),
        with: {
          pageVMs: {
            columns: {
              vmId: true,
            },
          },
        },
      });

      if (!page) {
        throw new BizError(BizCodeEnum.PageNotFound);
      }

      const status = page.pageVMs.map((vm) => ({
        id: vm.vmId,
        status: vmManager.checkSocket(vm.vmId),
      }));
      return c.json({
        total: page.pageVMs.length,
        online: status.filter((s) => s.status).length,
        offline: status.filter((s) => !s.status).length,
      });
    },
  )
  .get(
    "/:id/status/network",
    zValidator(
      "param",
      z.object({
        id: z.coerce.number(),
      }),
    ),
    async (c) => {
      const input = c.req.valid("param");

      const page = await db.query.page.findFirst({
        where: eq(pageTable.id, input.id),
        with: {
          pageVMs: {
            columns: {
              vmId: true,
            },
          },
        },
      });

      if (!page) {
        throw new BizError(BizCodeEnum.PageNotFound);
      }

      const vmIds = page.pageVMs.map((vm) => vm.vmId);

      const results = await db.execute(sql`
        WITH time_buckets AS (
          SELECT 
            time_bucket('60 seconds', time) as bucket,
            FIRST_VALUE(SUM(network_in)) OVER w as first_network_in,
            FIRST_VALUE(SUM(network_out)) OVER w as first_network_out,
            LAST_VALUE(SUM(network_in)) OVER w as last_network_in,
            LAST_VALUE(SUM(network_out)) OVER w as last_network_out,
            FIRST_VALUE(time) OVER w as first_time,
            LAST_VALUE(time) OVER w as last_time
          FROM metrics
          WHERE 
            ${inArray(metrics.vmId, vmIds)}
            AND time > NOW() - INTERVAL '60 seconds'
          GROUP BY time, bucket
          WINDOW w AS (
            PARTITION BY time_bucket('60 seconds', time)
            ORDER BY time
            RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
          )
        )
        SELECT DISTINCT
          bucket,
          last_network_in::numeric as network_in_total,
          last_network_out::numeric as network_out_total,
          ((last_network_in - first_network_in) / 
            EXTRACT(EPOCH FROM (last_time - first_time)))::numeric as network_in_speed,
          ((last_network_out - first_network_out) / 
            EXTRACT(EPOCH FROM (last_time - first_time)))::numeric as network_out_speed
        FROM time_buckets
        WHERE bucket = (SELECT MAX(bucket) FROM time_buckets)
        ORDER BY bucket DESC;
      `);

      if (results.rows.length === 0) {
        return c.json({
          uploadSpeed: 0,
          downloadSpeed: 0,
          totalUpload: 0,
          totalDownload: 0,
        });
      }

      const result = results.rows[0] as {
        network_in_speed: number;
        network_out_speed: number;
        network_in_total: number;
        network_out_total: number;
      };

      return c.json({
        uploadSpeed: result.network_out_speed,
        downloadSpeed: result.network_in_speed,
        totalUpload: result.network_out_total,
        totalDownload: result.network_in_total,
      });

      // return c.json({
      //   uploadSpeed:
      //     (Number(current.networkOut) - Number(previous.networkOut)) / 30,
      //   downloadSpeed:
      //     (Number(current.networkIn) - Number(previous.networkIn)) / 30,
      //   totalUpload: Number(current.networkOut),
      //   totalDownload: Number(current.networkIn),
      // });
    },
  )
  // Create a new page
  .post("/", zValidator("json", createPageSchema), async (c) => {
    const body = c.req.valid("json");
    const user = c.get("user");

    // if (body.handle) {
    //   // Check if handle already exists
    //   const existingPage = await db.query.page.findFirst({
    //     where: eq(pageTable.handle, body.handle),
    //   });

    //   if (existingPage) {
    //     throw new BizError(BizCodeEnum.HandleAlreadyExists);
    //   }
    // }

    // // Check if hostname already exists (if provided)
    // if (body.hostname) {
    //   const existingHostname = await db.query.page.findFirst({
    //     where: eq(pageTable.hostname, body.hostname),
    //   });

    //   if (existingHostname) {
    //     throw new BizError(BizCodeEnum.HostnameAlreadyExists);
    //   }
    // }

    const newPage = await db
      .insert(pageTable)
      .values({
        // handle: body.handle,
        // hostname: body.hostname || null,
        title: body.title,
        description: body.description || "",
        userId: user.id,
      })
      .returning()
      .then((pages) => pages[0]);

    return c.json({ page: newPage });
  })
  // Update a page
  .put(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.coerce.number(),
      }),
    ),
    zValidator("json", updatePageSchema),
    async (c) => {
      const input = c.req.valid("param");
      const body = c.req.valid("json");
      const user = c.get("user");

      // Check if page exists and belongs to user
      const existingPage = await db.query.page.findFirst({
        where: eq(pageTable.id, input.id),
      });

      if (!existingPage || existingPage.userId !== user.id) {
        throw new BizError(BizCodeEnum.PageNotFound);
      }

      const updatedPage = await db
        .update(pageTable)
        .set({
          title: body.title || existingPage.title,
          description:
            body.description !== undefined
              ? body.description
              : existingPage.description,
          updatedAt: new Date(),
        })
        .where(eq(pageTable.id, input.id))
        .returning()
        .then((pages) => pages[0]);

      return c.json({ page: updatedPage });
    },
  )
  .delete(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.coerce.number(),
      }),
    ),
    async (c) => {
      const input = c.req.valid("param");
      const user = c.get("user");

      // Check if page exists and belongs to user
      const existingPage = await db.query.page.findFirst({
        where: eq(pageTable.id, input.id),
      });

      if (!existingPage || existingPage.userId !== user.id) {
        throw new BizError(BizCodeEnum.PageNotFound);
      }

      await db.delete(pageTable).where(eq(pageTable.id, input.id));

      return c.json({ success: true });
    },
  )
  // Get all VMs (assigned/unassigned for a page)
  .get(
    "/:id/vm",
    zValidator(
      "param",
      z.object({
        id: z.coerce.number(),
      }),
    ),
    async (c) => {
      const input = c.req.valid("param");
      const user = c.get("user");

      const page = await db.query.page.findFirst({
        where: eq(pageTable.id, input.id),
      });

      if (!page || page.userId !== user.id) {
        throw new BizError(BizCodeEnum.PageNotFound);
      }

      // const vms = await db.query.vm.findMany({})
    },
  )
  // Add a VM to a page
  .post(
    "/:id/vm",
    zValidator(
      "param",
      z.object({
        id: z.coerce.number(),
      }),
    ),
    zValidator("json", createPageVMSchema.omit({ pageId: true })),
    async (c) => {
      const input = c.req.valid("param");
      const body = c.req.valid("json");
      const user = c.get("user");

      const page = await db.query.page.findFirst({
        where: eq(pageTable.id, input.id),
      });

      if (!page || page.userId !== user.id) {
        throw new BizError(BizCodeEnum.PageNotFound);
      }

      const newVM = await db
        .insert(pageVMTable)
        .values({
          pageId: input.id,
          vmId: body.vmId,
          order: body.order,
          nickname: body.nickname,
        })
        .returning()
        .then((vms) => vms[0]);

      return c.json({ vm: newVM });
    },
  )
  // Update a VM on a page
  .put(
    "/:id/vm/:vmId",
    zValidator(
      "param",
      z.object({
        id: z.coerce.number(),
        vmId: z.coerce.number(),
      }),
    ),
    zValidator("json", updatePageVMSchema),
    async (c) => {
      const input = c.req.valid("param");
      const body = c.req.valid("json");
      const user = c.get("user");

      const page = await db.query.page.findFirst({
        where: eq(pageTable.id, input.id),
      });

      if (!page || page.userId !== user.id) {
        throw new BizError(BizCodeEnum.PageNotFound);
      }

      const existingVM = await db.query.pageVM.findFirst({
        where: and(
          eq(pageVMTable.pageId, input.id),
          eq(pageVMTable.vmId, input.vmId),
        ),
      });

      if (!existingVM) {
        throw new BizError(BizCodeEnum.VMNotFound);
      }

      const updatedVM = await db
        .update(pageVMTable)
        .set({
          nickname: body.nickname,
          order: body.order,
        })
        .where(
          and(
            eq(pageVMTable.pageId, input.id),
            eq(pageVMTable.vmId, input.vmId),
          ),
        )
        .returning()
        .then((vms) => vms[0]);

      return c.json({ vm: updatedVM });
    },
  )
  // Delete a VM from a page
  .delete(
    "/:id/vm/:vmId",
    zValidator(
      "param",
      z.object({
        id: z.coerce.number(),
        vmId: z.coerce.number(),
      }),
    ),
    async (c) => {
      const input = c.req.valid("param");
      const user = c.get("user");

      const page = await db.query.page.findFirst({
        where: eq(pageTable.id, input.id),
      });

      if (!page || page.userId !== user.id) {
        throw new BizError(BizCodeEnum.PageNotFound);
      }

      const existingVM = await db.query.pageVM.findFirst({
        where: and(
          eq(pageVMTable.pageId, input.id),
          eq(pageVMTable.vmId, input.vmId),
        ),
      });

      if (!existingVM) {
        throw new BizError(BizCodeEnum.VMNotFound);
      }

      await db
        .delete(pageVMTable)
        .where(
          and(
            eq(pageVMTable.pageId, input.id),
            eq(pageVMTable.vmId, input.vmId),
          ),
        );

      return c.json({ success: true });
    },
  )
  .post("/:id/hostname", async (c) => {
    const input = c.req.valid("param");
    const user = c.get("user");

    const page = await db.query.page.findFirst({
      where: eq(pageTable.id, input.id),
    });
  });
// .get("/hostname", async (c) => {
//   const user = c.get("user");

//   cfClient.customHostnames.create({
//     zone_id: env.CF_ZONE_ID,
//     hostname: "test.vmboard.io",
//     proxied: true,
//   });
//   // const hostnames = await db.query.hostname.findMany({
//   //   where: eq(hostnameTable.userId, user.id),
//   // });
// });

export default app;
