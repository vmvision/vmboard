/*
 * This file is based on code from the nezha-dash project,
 * originally licensed under the Apache License 2.0.
 * The original license can be found in the LICENSE-APACHE file.
 *
 * Modifications made by AprilNEA <github@sku.moe>
 * Derived from: https://raw.githubusercontent.com/hamster1963/nezha-dash/ac15be6e71ba9804681b1fe760fa245f94912372/components/ServerCardInline.tsx
 * Licensed under the GNU General Public License v3.0 (GPLv3).
 */
import ServerFlag from "@/components/monitor/server-flag";
import ServerUsageBar from "@/components/monitor/server-usage-bar";
import { Card } from "@/components/ui/card";
import {
  GetFontLogoClass,
  GetOsName,
  MageMicrosoftWindows,
} from "@/lib/logo-class";
import { cn, formatBytes } from "@/lib/utils";
import { Link } from "next-view-transitions";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import type { ServerWithLiveMetrics } from "@/types/metrics";
import { env } from "@/env";
import { useMetricsData } from "./vm-data-context";

/**
 * Server CardInline with dynamic style
 */
const ServerCardInline: React.FC<{
  vmId: number;
  nickname: string;
  os?: string;
  osVersion?: string;
}> = ({ vmId, nickname, os, osVersion }) => {
  const t = useTranslations("Public.VM");
  const { getLatestMetrics } = useMetricsData();
  const metrics = getLatestMetrics(vmId);
  const online = !!metrics;

  const showFlag = env.NEXT_PUBLIC_FORCE_USE_SVG_FLAG;

  return online ? (
    <Link href={`/vm/${vmId}`} prefetch={true}>
      <Card
        className={cn(
          "flex w-full min-w-[900px] cursor-pointer items-center justify-start gap-3 p-3 hover:border-stone-300 hover:shadow-md md:px-5 lg:flex-row dark:hover:border-stone-700",
        )}
      >
        <section
          className={cn("grid items-center gap-2 lg:w-36")}
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
          <div className="relative w-28">
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
        <Separator orientation="vertical" className="mx-0 ml-2 h-8" />
        <div className="flex flex-col gap-2">
          <section className={cn("grid flex-1 grid-cols-9 items-center gap-3")}>
            <div
              className={"flex flex-row items-center gap-2 whitespace-nowrap"}
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
            <div className={"flex w-20 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("uptime")}</p>
              <div className="flex items-center font-semibold text-xs">
                {(metrics.uptime / 86400).toFixed(0)} {"Days"}
              </div>
            </div>
            <div className={"flex w-14 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("cpu")}</p>
              <div className="flex items-center font-semibold text-xs">
                {Number(metrics.cpuUsage).toFixed(2)}%
              </div>
              <ServerUsageBar value={metrics.cpuUsage} />
            </div>
            <div className={"flex w-14 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("memory")}</p>
              <div className="flex items-center font-semibold text-xs">
                {Number(metrics.memoryUsed).toFixed(2)}%
              </div>
              <ServerUsageBar value={metrics.memoryUsed} />
            </div>
            <div className={"flex w-14 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("disk")}</p>
              <div className="flex items-center font-semibold text-xs">
                {(Number(metrics.diskUsed) / Number(metrics.diskTotal)).toFixed(
                  2,
                )}
                %
              </div>
              <ServerUsageBar value={metrics.diskUsed} />
            </div>
            <div className={"flex w-16 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("upload")}</p>
              <div className="flex items-center font-semibold text-xs">
                {Number(metrics.networkOut) >= 1024
                  ? `${(Number(metrics.networkOut) / 1024).toFixed(2)}G/s`
                  : `${Number(metrics.networkOut).toFixed(2)}M/s`}
              </div>
            </div>
            <div className={"flex w-16 flex-col"}>
              <p className="text-muted-foreground text-xs">{t("download")}</p>
              <div className="flex items-center font-semibold text-xs">
                {Number(metrics.networkIn) >= 1024
                  ? `${(Number(metrics.networkIn) / 1024).toFixed(2)}G/s`
                  : `${Number(metrics.networkIn).toFixed(2)}M/s`}
              </div>
            </div>
            <div className={"flex w-20 flex-col"}>
              <p className="text-muted-foreground text-xs">
                {t("totalUpload")}
              </p>
              <div className="flex items-center font-semibold text-xs">
                {formatBytes(Number(metrics.networkOut))}
              </div>
            </div>
            <div className={"flex w-20 flex-col"}>
              <p className="text-muted-foreground text-xs">
                {t("totalDownload")}
              </p>
              <div className="flex items-center font-semibold text-xs">
                {formatBytes(Number(metrics.networkIn))}
              </div>
            </div>
          </section>
        </div>
      </Card>
    </Link>
  ) : (
    <Link href={`/server/${vmId}`} prefetch={true}>
      <Card
        className={cn(
          "flex min-h-[61px] min-w-[900px] flex-row items-center justify-start gap-3 p-3 hover:border-stone-300 hover:shadow-md md:px-5 dark:hover:border-stone-700",
        )}
      >
        <section
          className={cn("grid items-center gap-2 lg:w-40")}
          style={{ gridTemplateColumns: "auto auto 1fr" }}
        >
          <span className="h-2 w-2 shrink-0 self-center rounded-full bg-red-500" />
          {/* <div
            className={cn(
              "flex items-center justify-center",
              showFlag ? "min-w-[17px]" : "min-w-0",
            )}
          >
            {showFlag ? <ServerFlag country_code={country_code} /> : null}
          </div> */}
          <div className="relative w-28">
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

export default ServerCardInline;
