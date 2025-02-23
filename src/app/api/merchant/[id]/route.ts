import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { merchant as merchantTable } from "@/db/schema/merchant";
import DMIT from "vmapi/dmit";
import { getSessionOrThrow } from "@/lib/session";

export async function GET() {
  const session = await getSessionOrThrow();
  const merchant = await db.query.merchant.findFirst({
    where: and(
      eq(merchantTable.id, 4),
      eq(merchantTable.userId, session.user.id),
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
  console.log(vms);
  return NextResponse.json(vms);
}
