import { Shell } from "@/components/shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageManagementData } from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "页面管理",
  description: "创建和管理您的虚拟机监控页面展示",
};

export default function Page() {
  return (
    <Shell>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="font-bold text-2xl tracking-tight">页面管理</h2>
          <p className="text-muted-foreground">
            创建和管理您的虚拟机监控页面展示
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>您的监控页面</CardTitle>
            <CardDescription>
              您可以为不同的用途创建多个监控页面，每个页面可以有自己的 VM
              集合和布局
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PageManagementData />
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
