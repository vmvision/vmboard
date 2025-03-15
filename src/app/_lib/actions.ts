"use server";

import db from "@/db/index";
import { type SSHInfo, type VM, vm as vmTable } from "@/db/schema/vm";
import { takeFirstOrThrow } from "@/db/utils";
import { and, asc, eq, inArray, not } from "drizzle-orm";
import { revalidateTag, unstable_noStore } from "next/cache";

import { getSession, getSessionOrThrow } from "@/lib/session";
import { getErrorMessage } from "@/lib/handle-error";

import type { CreateVMSchema, UpdateVMSchema } from "./validations";
import type { Page, NewPage } from "@/db/schema/page";

// export async function getCustomConfig(key: string) {
//   const session = await getSession();
//   const config = await db
//     .select()
//     .from(configTable)
//     .where(eq(configTable.key, key));
// }

export async function createVM(input: CreateVMSchema) {
  unstable_noStore();
  const session = await getSessionOrThrow();

  try {
    await db
      .insert(vmTable)
      .values({
        nickname: input.nickname,
        status: input.status,
        userId: session.user.id,
        merchantId: input.merchantId,
        // label: input.label,
        // priority: input.priority,
      })
      .returning({
        id: vmTable.id,
      })
      .then(takeFirstOrThrow);

    revalidateTag("vms");
    revalidateTag("vms-status-counts");

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function updateVM(input: UpdateVMSchema & { id: number }) {
  unstable_noStore();
  const session = await getSessionOrThrow();
  try {
    const data = await db
      .update(vmTable)
      .set({
        nickname: input.nickname,
        // label: input.label,
        status: input.status,
        // priority: input.priority,
      })
      .where(eq(vmTable.id, input.id))
      .returning({
        status: vmTable.status,
        // priority: vmTable.priority,
      })
      .then(takeFirstOrThrow);

    revalidateTag("vms");
    if (data.status === input.status) {
      revalidateTag("vm-status-counts");
    }
    // if (data.priority === input.priority) {
    //   revalidateTag("task-priority-counts");
    // }

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function updateVMs(input: {
  ids: number[];
  // label?: Task["label"];
  status?: VM["status"];
  // priority?: Task["priority"];
}) {
  unstable_noStore();
  const session = await getSessionOrThrow();
  try {
    const data = await db
      .update(vmTable)
      .set({
        // label: input.label,
        status: input.status,
        // priority: input.priority,
      })
      .where(inArray(vmTable.id, input.ids))
      .returning({
        status: vmTable.status,
        // priority: vmTable.priority,
      })
      .then(takeFirstOrThrow);

    revalidateTag("tasks");
    if (data.status === input.status) {
      revalidateTag("vm-status-counts");
    }
    // if (data.priority === input.priority) {
    //   revalidateTag("vm-priority-counts");
    // }

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function deleteVM(input: { id: number }) {
  unstable_noStore();
  const session = await getSessionOrThrow();
  try {
    await db.transaction(async (tx) => {
      await tx.delete(vmTable).where(eq(vmTable.id, input.id));

      // Create a new task for the deleted one
      // await tx.insert(vmTable).values(generateRandomTask());
    });

    revalidateTag("vms");
    revalidateTag("vm-status-counts");
    // revalidateTag("vm-priority-counts");

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function deleteVMs(input: { ids: number[] }) {
  unstable_noStore();
  const session = await getSessionOrThrow();
  try {
    // await db.transaction(async (tx) => {
    //   await tx.delete(vmTable).where(inArray(vmTable.id, input.ids));

    //   // Create new tasks for the deleted ones
    //   await tx
    //     .insert(vmTable)
    //     .values(input.ids.map(() => generateRandomTask()));
    // });

    revalidateTag("vms");
    revalidateTag("vm-status-counts");
    // revalidateTag("vm-priority-counts");

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function setupVMSSHInfo(input: {
  id: number;
  sshInfo: SSHInfo;
}) {
  unstable_noStore();
  const session = await getSessionOrThrow();
  try {
    await db
      .update(vmTable)
      .set({
        sshInfo: input.sshInfo,
      })
      .where(
        and(eq(vmTable.id, input.id), eq(vmTable.userId, session.user.id)),
      );
    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}