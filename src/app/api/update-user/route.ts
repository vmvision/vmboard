import { auth } from "@/lib/auth";
import db from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: new Headers(request.headers),
  });

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const userId = formData.get("userId") as string;
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;

  // 校验用户 ID
  if (!userId || userId !== session.user.id) {
    return NextResponse.json(
      { success: false, error: "Invalid user ID" },
      { status: 403 }
    );
  }

  // 校验昵称
  if (!name || name.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: "昵称不能为空" },
      { status: 400 }
    );
  }

  // 校验用户名格式（示例：只允许字母、数字和下划线）
  const usernamePattern = /^[a-zA-Z0-9_]+$/;
  if (username && !usernamePattern.test(username)) {
    return NextResponse.json(
      { success: false, error: "用户名只能包含字母、数字和下划线" },
      { status: 400 }
    );
  }

  // 校验用户名是否已被占用
  if (username) {
    const existingUser = await db.query.user.findFirst({
      where: (user, { eq, and, not }) =>
        and(eq(user.username, username), not(eq(user.id, userId))),
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "用户名已被占用" },
        { status: 400 }
      );
    }
  }

  try {
    await db
      .update(user)
      .set({
        name,
        username: username || null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}