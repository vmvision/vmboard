"use client";

import { use } from "react";
import useSWR from "swr";
import apiClient, { fetchWrapper } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Shell } from "@/components/shell";
import { ModifyVmDetailInPageDialog } from "@/components/page/modify-vm-dialog";
import { AddVmDialog } from "@/components/page/add-vm-dialog";
import { useTranslations } from "next-intl";
import { Markdown } from "@/components/markdown";
type Params = Promise<{ pageId: string }>;

export default function PageDetail({ params }: { params: Params }) {
  const t = useTranslations("Private.Page.Detail");
  const tP = useTranslations("Public");
  const tAction = useTranslations("Private.Action");

  const pageId = Number(use(params).pageId);

  const { data, error, isLoading } = useSWR(
    ["/api/page", { param: { id: pageId } }],
    fetchWrapper(apiClient.page[":id"].$get),
  );

  if (isLoading) {
    return <PageDetailSkeleton />;
  }

  if (error || !data) {
    return (
      <Shell>
        <div className="py-6 text-center">
          <p className="text-muted-foreground">无法加载页面信息</p>
          <p className="mt-2 text-muted-foreground text-sm">
            {error?.message || tP("Common.unknownError")}
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl">{data.title}</h1>
            {data.handle && (
              <p className="mt-1 text-muted-foreground text-sm">
                {t("accessLink")}: /{data.handle}
              </p>
            )}
            {data.hostname && (
              <p className="text-muted-foreground text-sm">
                {t("customDomain")}: {data.hostname}
              </p>
            )}
            <Markdown content={data.description} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">{t("editPage")}</Button>
            <Button variant="destructive">{t("deletePage")}</Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xl">{t("vmList")}</h2>
            <AddVmDialog pageId={pageId}>
              <Button>{t("addVm")}</Button>
            </AddVmDialog>
          </div>

          {data.pageVMs && data.pageVMs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.pageVMs.map((pageVm) => (
                <Card key={pageVm.vmId}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {pageVm.nickname || pageVm.vm.nickname}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-sm">
                        {tP("VM.os")}: {pageVm.vm.monitorInfo?.os || "未知"}{" "}
                        {pageVm.vm.monitorInfo?.osVersion || ""}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {tP("VM.platform")}:{" "}
                        {pageVm.vm.monitorInfo?.platform || "未知"}{" "}
                        {pageVm.vm.monitorInfo?.platformVersion || ""}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <ModifyVmDetailInPageDialog pageId={pageId} vmId={pageVm.vmId}>
                          <Button size="sm" variant="outline">
                            {tAction("edit")}
                          </Button>
                        </ModifyVmDetailInPageDialog>
                        <Button size="sm" variant="destructive">
                          {tAction("delete")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border py-6 text-center">
              <p className="text-muted-foreground">
                {t("emptyVm")}
              </p>
              <Button className="mx-auto mt-4">{t("addFirstVm")}</Button>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

function PageDetailSkeleton() {
  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2 mt-4">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
