"use client";

import useSWR from "swr";
import apiClient, { fetchWrapper } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { CreatePageDialog } from "@/components/page/create-page-dialog";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import { useTranslations } from "next-intl";

export function PageManagementData() {
  const t = useTranslations("Private.Page.Management");
  const tD = useTranslations("Private.Page.Detail");
  const tAction = useTranslations("Private.Action");

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
          <p className="text-muted-foreground">{t("emptyPage")}</p>
          <CreatePageDialog>
            <Button className="mx-auto mt-4">{t("createFirstPage")}</Button>
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
                    {tAction("edit")}
                  </Button>
                  <Button variant="destructive" size="sm">
                    {tAction("delete")}
                  </Button>
                </div>
              </div>
              <p className="mb-2 text-muted-foreground">
                {tD("accessLink")}: /{page.handle}
              </p>
              <div className="mt-3 flex flex-row items-center gap-2">
                <p className="text-muted-foreground text-sm">
                  {t("vmCount", { count: page.vmCount })}
                </p>
                <p className="ml-auto text-muted-foreground text-sm">
                  {t("createdAt", { date: page.createdAt })}
                </p>
              </div>
            </div>
          ))}
          <CreatePageDialog>
            <Button className="mt-2 w-full">{t("addPage")}</Button>
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
