import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // 假设你有 auth 工具来获取会话
import db from "@/db";
import { users } from "@/db/schema"; // 导入 user 表
import { eq } from "drizzle-orm";

// 定义请求体的类型
interface UpdateUserRequest {
    name: string;
    username?: string;
  }
  
  // 定义响应体的类型
  interface UpdateUserResponse {
    success: boolean;
    error?: string;
  }
  
  // 处理 POST 请求：更新用户信息
  export async function POST(request: NextRequest) {
    try {
      // 获取会话信息，传入 request.headers
      const session = await auth.api.getSession({
        headers: request.headers, // 直接使用 request.headers，符合 Headers 类型
      });
  
      // 如果没有会话，返回 401 未授权
      if (!session) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }
  
      // 解析请求体
      const body = (await request.json()) as UpdateUserRequest;
      const { name, username } = body;
  
      // 验证请求数据
      if (!name) {
        return NextResponse.json(
          { success: false, error: "Name is required" },
          { status: 400 },
        );
      }
  
      // 更新用户信息
      await db
        .update(users)
        .set({
          name,
          username: username || null, // 如果 username 为空，设为 null
          updatedAt: new Date(), // 更新时间
        })
        .where(eq(users.id, session.user.id));
  
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 },
      );
    }
  }