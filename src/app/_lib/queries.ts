import "server-only";

import db from "@/db";
import { vm as vmTable, type VM } from "@/db/schema/vm";
import { page as pageTable } from "@/db/schema/page";
import { merchant as merchantTable } from "@/db/schema/merchant";
import { users, session } from "@/db/schema"; // 导入 user 和 session 表
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  lte,
} from "drizzle-orm";

import { getSessionOrThrow } from "@/lib/session";
import { filterColumns } from "@/lib/filter-columns";
import { unstable_cache } from "@/lib/unstable-cache";

import type { GetVMSchema } from "./validations";
import { sshKeysTable } from "@/db/schema";

// 现有查询函数（保持不变）
export async function getVM(vmId: number) {
  const session = await getSessionOrThrow();
  return await unstable_cache(
    async () =>
      db.query.vm.findFirst({
        where: and(eq(vmTable.id, vmId), eq(vmTable.userId, session.user.id)),
      }),
    [String(vmId)],
    {
      revalidate: 60,
      tags: ["vm"],
    },
  )();
}

export async function getVMs(input: GetVMSchema) {
  await getSessionOrThrow();
  return await unstable_cache(
    async () => {
      try {
        const offset = (input.page - 1) * input.perPage;
        const fromDate = input.from ? new Date(input.from) : undefined;
        const toDate = input.to ? new Date(input.to) : undefined;
        const advancedTable = input.flags.includes("advancedTable");

        const advancedWhere = filterColumns({
          table: vmTable,
          filters: input.filters,
          joinOperator: input.joinOperator,
        });

        const where = advancedTable
          ? advancedWhere
          : and(
              input.title
                ? ilike(vmTable.nickname, `%${input.title}%`)
                : undefined,
              input.status.length > 0
                ? inArray(vmTable.status, input.status)
                : undefined,
              fromDate ? gte(vmTable.createdAt, fromDate) : undefined,
              toDate ? lte(vmTable.createdAt, toDate) : undefined,
            );

        const orderBy =
          input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc ? desc(vmTable[item.id]) : asc(vmTable[item.id]),
              )
            : [asc(vmTable.createdAt)];

        const { data, total } = await db.transaction(async (tx) => {
          const data = await tx
            .select({
              id: vmTable.id,
              nickname: vmTable.nickname,
              status: vmTable.status,
              createdAt: vmTable.createdAt,
              merchantId: vmTable.merchantId,
              ipAddress: vmTable.ipAddress,
              metadata: vmTable.metadata,
              merchant: {
                id: merchantTable.id,
                nickname: merchantTable.nickname,
                merchant: merchantTable.merchant,
              },
            })
            .from(vmTable)
            .leftJoin(merchantTable, eq(vmTable.merchantId, merchantTable.id))
            .limit(input.perPage)
            .offset(offset)
            .where(where)
            .orderBy(...orderBy);

          const total = await tx
            .select({
              count: count(),
            })
            .from(vmTable)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0);

          return {
            data,
            total,
          };
        });

        const pageCount = Math.ceil(total / input.perPage);
        return { data, pageCount };
      } catch (_err) {
        return { data: [], pageCount: 0 };
      }
    },
    [JSON.stringify(input)],
    {
      revalidate: 1,
      tags: ["vms"],
    },
  )();
}

export async function getVMStatusCounts() {
  return unstable_cache(
    async () => {
      try {
        return await db
          .select({
            status: vmTable.status,
            count: count(),
          })
          .from(vmTable)
          .groupBy(vmTable.status)
          .having(gt(count(), 0))
          .then((res) =>
            res.reduce(
              (acc, { status, count }) => {
                acc[status] = count;
                return acc;
              },
              {} as Record<VM["status"], number>,
            ),
          );
      } catch (_err) {
        return {} as Record<VM["status"], number>;
      }
    },
    ["vm-status-counts"],
    {
      revalidate: 3600,
    },
  )();
}

export async function getMerchants() {
  const session = await getSessionOrThrow();
  return await unstable_cache(
    async () => {
      return await db.query.merchant.findMany({
        where: eq(merchantTable.userId, session.user.id),
      });
    },
    ["merchants"],
    {
      revalidate: 3600,
    },
  )();
}

export async function getSSHKey() {
  const session = await getSessionOrThrow();
  return await unstable_cache(
    async () =>
      db.query.sshKeysTable.findMany({
        where: eq(sshKeysTable.userId, session.user.id),
      }),
    [session.user.id],
    {
      revalidate: 3600,
      tags: ["ssh-key"],
    },
  )();
}

export async function getPageData(handle: string) {
  return await unstable_cache(
    async () => {
      const page = await db.query.page.findFirst({
        where: eq(pageTable.handle, handle),
      });
      const vms = await db.query.vm.findMany({
        where: page?.vmIds ? inArray(vmTable.id, page.vmIds as number[]) : undefined,
        columns: {
          id: true,
          nickname: true,
          monitorInfo: true,
        },
      });
      return {
        page,
        vms: vms.map((vm) => ({
          id: vm.id,
          nickname: vm.nickname,
          monitorInfo: {
            os: vm.monitorInfo?.os,
            osVersion: vm.monitorInfo?.osVersion,
            platform: vm.monitorInfo?.platform,
            platformVersion: vm.monitorInfo?.platformVersion,
          },
        })),
      };
    },
    [handle],
    {
      revalidate: 3600,
      tags: ["page"],
    },
  )();
}

// 新增：获取用户信息
export async function getUser(userId: string) {
  return await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .execute()
    .then((res) => res[0] || null);
}

// 新增：获取最近会话
export async function getLatestSession(userId: string) {
  const sessionRecord = await db
    .select({
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
    })
    .from(session)
    .where(eq(session.userId, userId))
    .orderBy(desc(session.createdAt))
    .limit(1)
    .execute()
    .then((res) => res[0] || null);

  return sessionRecord;
}