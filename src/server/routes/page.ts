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
import { vm as vmTable } from "@/db/schema/vm";
import {
  pageVM as pageVMTable,
  hostname as hostnameTable,
} from "@/db/schema/page";
import { pageBind as pageBindTable } from "@/db/schema/page";
import { and, count, eq, inArray } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import appFactory from "../factory";
import BizError, { BizCodeEnum } from "../error";
import Cloudflare from "cloudflare";
import { env } from "@/env";
import { describeRoute } from "hono-openapi";
import { checkVmSocket } from "../monitor/socket";

const cfClient = new Cloudflare({
  apiEmail: env.CF_EMAIL,
  apiKey: env.CF_API_KEY,
});

const app = appFactory
  .createApp()
  // Get all pages for the current user
  .get("/", async (c) => {
    const user = c.get("user");

    const rows = await db
      .select({
        id: pageTable.id,
        title: pageTable.title,
        description: pageTable.description,
        bind: pageBindTable,
        vmCount: count(pageVMTable.vmId),
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
          hostname: z.string(),
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
        status: checkVmSocket(vm.vmId),
      }));
      return c.json({
        total: page.pageVMs.length,
        online: status.filter((s) => s.status).length,
        offline: status.filter((s) => !s.status).length,
      });
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

      // Check if hostname already exists (if provided and changed)
      if (body.hostname && body.hostname !== existingPage.hostname) {
        const existingHostname = await db.query.page.findFirst({
          where: eq(pageTable.hostname, body.hostname),
        });

        if (existingHostname) {
          throw new BizError(BizCodeEnum.HostnameAlreadyExists);
        }
      }

      const updatedPage = await db
        .update(pageTable)
        .set({
          title: body.title || existingPage.title,
          description:
            body.description !== undefined
              ? body.description
              : existingPage.description,
          hostname:
            body.hostname !== undefined ? body.hostname : existingPage.hostname,
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
