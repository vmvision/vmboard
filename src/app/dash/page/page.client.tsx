"use client";

import useSWR from "swr";
import apiClient, { fetchWrapper } from "@/lib/api-client";
import { Shell } from "@/components/shell";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreatePageDialog } from "@/components/page/create-page-dialog";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
export function PageManagementData() {
  const { data, isLoading } = useSWR(
    ["/api/page", {}],
    fetchWrapper(apiClient.page.$get),
  );
  if (!data) {
    if (isLoading) {
      return <PageManagementSkeleton />;
    }
    return <div>Error</div>;
  }
  return (
    <div className="space-y-6">
      {data?.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">您还没有创建任何监控页面</p>
          <CreatePageDialog>
            <Button className="mx-auto mt-4">创建第一个页面</Button>
          </CreatePageDialog>
        </div>
      ) : (
        <div className="grid gap-6">
          {data?.map((page) => (
            <div key={page.id} className="rounded-lg border p-4">
              <div className="mb-4 flex items-center justify-between">
                <Link href={`/dash/page/${page.id}`}>
                  <h3 className="font-medium text-lg">{page.title}</h3>
                </Link>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">
                    编辑
                  </Button>
                  <Button variant="destructive" size="sm">
                    删除
                  </Button>
                </div>
              </div>
              <p className="mb-2 text-muted-foreground">
                访问链接: /{page.handle}
              </p>
              <div className="mt-3">
                <p className="text-muted-foreground text-sm">
                  {page.vmCount} 台虚拟机
                </p>
              </div>
            </div>
          ))}
          <CreatePageDialog>
            <Button className="mt-2 w-full">添加新页面</Button>
          </CreatePageDialog>
        </div>
      )}
    </div>
  );
}

function PageManagementSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div className="grid gap-2" key={i}>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
