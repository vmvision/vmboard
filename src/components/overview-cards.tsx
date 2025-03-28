"use client";

import AnimateCount from "@/components/derive-ui/animate-count";
import { ArrowDownCircleIcon, ArrowUpCircleIcon, Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatBytes, formatKiloBytes } from "@/lib/utils";
// import {
//   ArrowDownCircleIcon,
//   ArrowUpCircleIcon,
// } from "@heroicons/react/20/solid";
import { useTranslations } from "next-intl";
import type React from "react";
import useSWR from "swr";
import apiClient, { fetchWrapper } from "@/lib/api-client";
import { Skeleton } from "./ui/skeleton";

const ServerOverview: React.FC<{
  type: "vm" | "page";
  pageId?: number;
}> = ({ type, pageId }) => {
  const t = useTranslations("Public.Overview");
  const tVM = useTranslations("Public.VM");

  const { data, error, isLoading } = useSWR(
    type === "vm"
      ? ["/api/vm/status"]
      : ["/api/page/status", { param: { id: pageId } }],
    fetchWrapper(
      type === "vm"
        ? apiClient.vm.status.$get
        : apiClient.page[":id"].status.$get,
    ),
  );

  const network = useSWR(
    ["/api/page/status/network", { param: { id: pageId } }],
    fetchWrapper(apiClient.page[":id"].status.network.$get),
    // type === "vm"
    //   ? ["/api/vm/status/network"]
    //   : ["/api/page/status/network", { param: { id: pageId } }],
    //   fetchWrapper(
    //     type === "vm"
    //     ? apiClient.vm.status.network.$get
    //     : apiClient.page[":id"].status.network.$get,
    // ),
  );

  const status = "online";
  const filter = true;
  // const { data, error, isLoading } = useServerData();
  // const { status, setStatus } = useStatus();
  // const { filter, setFilter } = useFilter();

  // const disableCartoon = getEnv("NEXT_PUBLIC_DisableCartoon") === "true";

  // if (error) {
  //   const errorInfo = error as any;
  //   return (
  //     <div className="flex flex-col items-center justify-center">
  //       <p className="font-medium text-sm opacity-40">
  //         Error status:{errorInfo?.status}{" "}
  //         {errorInfo.info?.cause ?? errorInfo?.message}
  //       </p>
  //       <p className="font-medium text-sm opacity-40">{t("error_message")}</p>
  //     </div>
  //   );
  // }

  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <OverviewCard
        label={t("totalServers")}
        count={data?.total}
        className={cn(
          "group cursor-pointer transition-all hover:border-blue-500",
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
        </span>
      </OverviewCard>
      <OverviewCard
        label={t("onlineServers")}
        count={data?.online}
        className={cn(
          "cursor-pointer ring-1 ring-transparent transition-all hover:ring-green-500",
          {
            "border-transparent ring-2 ring-green-500": status === "online",
          },
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
      </OverviewCard>
      <OverviewCard
        label={t("offlineServers")}
        count={data?.offline}
        className={cn(
          "cursor-pointer ring-1 ring-transparent transition-all hover:ring-red-500",
          {
            "border-transparent ring-2 ring-red-500": status === "offline",
          },
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
      </OverviewCard>
      <OverviewCard
        label={tVM("network")}
        count={null}
        className={cn(
          "group cursor-pointer ring-1 ring-transparent transition-all hover:ring-purple-500",
          {
            // "border-transparent ring-2 ring-purple-500": filter === true,
          },
        )}
      >
        <section className="flex flex-row flex-wrap items-start gap-1 pr-0">
          <p className="text-nowrap font-medium text-[12px] text-blue-800 dark:text-blue-400">
            ↑{formatBytes(network.data?.totalUpload)}
          </p>
          <p className="text-nowrap font-medium text-[12px] text-purple-800 dark:text-purple-400">
            ↓{formatBytes(network.data?.totalDownload)}
          </p>
        </section>
        <section className="-mr-1 flex flex-row flex-wrap items-start gap-1 sm:items-center">
          <p className="flex items-center text-nowrap font-semibold text-[11px]">
            <ArrowUpCircleIcon className="mr-0.5 size-3 sm:mb-[1px]" />
            {formatBytes(network.data?.uploadSpeed)}/s
          </p>
          <p className="flex items-center text-nowrap font-semibold text-[11px]">
            <ArrowDownCircleIcon className="mr-0.5 size-3" />
            {formatBytes(network.data?.downloadSpeed)}/s
          </p>
        </section>
      </OverviewCard>
    </section>
  );
};

const OverviewCard: React.FC<
  {
    label: string;
    count?: number | null;
  } & React.ComponentProps<typeof Card>
> = ({ label, children, ...props }) => {
  return (
    <Card {...props}>
      <CardContent className="flex h-full items-center px-6 py-3">
        <section className="flex flex-col gap-1">
          <p className="font-medium text-sm md:text-base">{label}</p>
          <div className="flex min-h-[28px] items-center gap-2">
            {children}
            {typeof props?.count === "number" ? (
              <AnimateCount
                count={props.count}
                className="font-semibold text-lg"
              />
            ) : (
              props?.count === undefined && (
                <div className="flex h-7 items-center">
                  <Skeleton className="h-4 w-16" />
                </div>
              )
            )}
          </div>
        </section>
      </CardContent>
    </Card>
  );
};

export default ServerOverview;
