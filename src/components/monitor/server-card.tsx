/*
 * This file is based on code from the nezha-dash project,
 * originally licensed under the Apache License 2.0.
 * The original license can be found in the LICENSE-APACHE file.
 *
 * Modifications made by AprilNEA <github@sku.moe>
 * Derived from: https://raw.githubusercontent.com/hamster1963/nezha-dash/ac15be6e71ba9804681b1fe760fa245f94912372/components/ServerCard.tsx
 * Licensed under the GNU General Public License v3.0 (GPLv3).
 */
import ServerFlag from "@/components/monitor/server-flag";
import ServerUsageBar from "@/components/monitor/server-usage-bar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { env } from "@/env";
import {
  GetFontLogoClass,
  GetOsName,
  MageMicrosoftWindows,
} from "@/lib/logo-class";
import { cn, formatBytes, calculatePercentage } from "@/lib/utils";
import type { ServerWithLiveMetrics } from "@/types/metrics";
import { useTranslations } from "next-intl";
import { Link } from "next-view-transitions";
import { useMetricsData } from "./vm-data-context";

const ServerCard: React.FC<{
  vmId: number;
  nickname: string;
}> = ({ vmId, nickname }) => {
  const t = useTranslations("Public.VM");
  const { getLatestMetrics } = useMetricsData();
  const metrics = getLatestMetrics(vmId);
  const online = !!metrics;

  const showFlag = env.NEXT_PUBLIC_SHOW_FLAG;
  const showNetTransfer = env.NEXT_PUBLIC_SHOW_NETWORK_TRANSFER;
  const fixedTopServerName = env.NEXT_PUBLIC_FIXED_TOP_SERVER_NAME;

  return online ? (
    <Link href={`/vm/${vmId}`} prefetch={true}>
      <Card
        className={cn(
          "flex cursor-pointer flex-col items-center justify-start gap-3 p-3 hover:border-stone-300 hover:shadow-md md:px-5 dark:hover:border-stone-700",
          {
            "flex-col": fixedTopServerName,
            "lg:flex-row": !fixedTopServerName,
          },
        )}
      >
        <section
          className={cn("grid items-center gap-2", {
            "lg:w-40": !fixedTopServerName,
          })}
          style={{ gridTemplateColumns: "auto auto 1fr" }}
        >
          <span className="h-2 w-2 shrink-0 self-center rounded-full bg-green-500" />
          <div
            className={cn(
              "flex items-center justify-center",
              showFlag ? "min-w-[17px]" : "min-w-0",
            )}
          >
            {showFlag ? <ServerFlag country_code="cn" /> : null}
          </div>
          <div className="relative">
            <p
              className={cn(
                "break-all font-bold tracking-tight",
                showFlag ? "text-xs " : "text-sm",
              )}
            >
              {nickname}
            </p>
          </div>
        </section>
        <div className="flex flex-col gap-2">
          <section
            className={cn("grid grid-cols-5 items-center gap-3", {
              "lg:grid-cols-6 lg:gap-4": fixedTopServerName,
            })}
          >
            {fixedTopServerName && (
              <div
                className={
                  "col-span-1 hidden items-center gap-2 lg:flex lg:flex-row"
                }
              >
                <div className="font-semibold text-xs">
                  {/* {vmInfo.platform.includes("Windows") ? (
                    <MageMicrosoftWindows className="size-[10px]" />
                  ) : (
                    <p className={`fl-${GetFontLogoClass(vmInfo.platform)}`} />
                  )} */}
                </div>
                <div className={"flex w-14 flex-col"}>
                  <p className="text-muted-foreground text-xs">{t("system")}</p>
                  <div className="flex items-center font-semibold text-[10.5px]">
                    {/* {vmInfo.platform.includes("Windows")
                      ? "Windows"
                      : GetOsName(vmInfo.platform)} */}
                  </div>
                </div>
              </div>
            )}
            <div className={"flex w-14 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("cpu")}</p>
              <div className="flex items-center font-semibold text-xs">
                {Number(metrics.cpuUsage).toFixed(2)}%
              </div>
              <ServerUsageBar value={metrics?.cpuUsage} />
            </div>
            <div className={"flex w-14 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("memory")}</p>
              <div className="flex items-center font-semibold text-xs">
                {Number(metrics.memoryUsage).toFixed(2)}%
              </div>
              <ServerUsageBar value={metrics.memoryUsage} />
            </div>
            <div className={"flex w-14 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("disk")}</p>
              <div className="flex items-center font-semibold text-xs">
                {calculatePercentage(metrics.diskUsed, metrics.diskTotal, 2)}%
              </div>
              <ServerUsageBar value={metrics.diskUsed} />
            </div>
            <div className={"flex w-14 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("upload")}</p>
              <div className="flex items-center font-semibold text-xs">
                {metrics.networkOutSpeed.toFixed(2)}M/s
              </div>
            </div>
            <div className={"flex w-14 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("download")}</p>
              <div className="flex items-center font-semibold text-xs">
                {metrics.networkInSpeed.toFixed(2)}M/s
              </div>
            </div>
          </section>
          {showNetTransfer && (
            <section className={"flex items-center justify-between gap-1"}>
              <Badge
                variant="secondary"
                className="flex-1 items-center justify-center text-nowrap rounded-[8px] border-muted-50 text-[11px] shadow-md shadow-neutral-200/30 dark:shadow-none"
              >
                {t("totalUpload")}:{formatBytes(metrics.networkOutSpeed)}
              </Badge>
              <Badge
                variant="outline"
                className="flex-1 items-center justify-center text-nowrap rounded-[8px] text-[11px] shadow-md shadow-neutral-200/30 dark:shadow-none"
              >
                {t("totalDownload")}:{formatBytes(metrics.networkInSpeed)}
              </Badge>
            </section>
          )}
        </div>
      </Card>
    </Link>
  ) : (
    <Link href={`/server/${vmId}`} prefetch={true}>
      <Card
        className={cn(
          "flex cursor-pointer flex-col items-center justify-start gap-3 p-3 hover:border-stone-300 hover:shadow-md md:px-5 dark:hover:border-stone-700",
          showNetTransfer
            ? "min-h-[123px] lg:min-h-[91px]"
            : "min-h-[93px] lg:min-h-[61px]",
          {
            "flex-col": fixedTopServerName,
            "lg:flex-row": !fixedTopServerName,
          },
        )}
      >
        <section
          className={cn("grid items-center gap-2", {
            "lg:w-40": !fixedTopServerName,
          })}
          style={{ gridTemplateColumns: "auto auto 1fr" }}
        >
          <span className="h-2 w-2 shrink-0 self-center rounded-full bg-red-500" />
          <div
            className={cn(
              "flex items-center justify-center",
              showFlag ? "min-w-[17px]" : "min-w-0",
            )}
          >
            {showFlag ? <ServerFlag country_code="cn" /> : null}
          </div>
          <div className="relative">
            <p
              className={cn(
                "break-all font-bold tracking-tight",
                showFlag ? "text-xs" : "text-sm",
              )}
            >
              {nickname}
            </p>
          </div>
        </section>
      </Card>
    </Link>
  );
};

export default ServerCard;
