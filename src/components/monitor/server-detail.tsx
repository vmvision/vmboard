/*
 * This file is based on code from the nezha-dash project,
 * originally licensed under the Apache License 2.0.
 * The original license can be found in the LICENSE-APACHE file.
 *
 * Modifications made by AprilNEA <github@sku.moe>
 * Derived from: https://github.com/hamster1963/nezha-dash/raw/ac15be6e71ba9804681b1fe760fa245f94912372/app/(main)/ClientComponents/detail/ServerDetailClient.tsx
 * Licensed under the GNU General Public License v3.0 (GPLv3).
 */
"use client";

// import { BackIcon } from "@/components/Icon";
import ServerFlag from "@/components/monitor/server-ip-info";
import { ServerDetailLoading } from "@/components/monitor/server-detail-loading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatBytes } from "@/lib/utils";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { useTranslations } from "next-intl";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import apiClient, { fetchWrapper } from "@/lib/api-client";

countries.registerLocale(enLocale);

interface ServerDetailProps {
  vmId: number;
}

export default function ServerDetail({ vmId }: ServerDetailProps) {
  const t = useTranslations("Public.VM");
  const router = useRouter();

  // const [hasHistory, setHasHistory] = useState(false);

  // useEffect(() => {
  //   window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  // }, []);

  // useEffect(() => {
  //   const previousPath = sessionStorage.getItem("fromMainPage");
  //   if (previousPath) {
  //     setHasHistory(true);
  //   }
  // }, []);

  // const linkClick = () => {
  //   if (hasHistory) {
  //     router.back();
  //   } else {
  //     router.push("/");
  //   }
  // };

  const vmInfo = useSWR(
    ["/api/vm/:id/monitor", { param: { id: vmId } }],
    fetchWrapper(apiClient.vm[":id"].monitor.$get),
  );
  
  const {
    data: { status },
  } = useSWR(
    ["/api/vm/:id/monitor/status", { param: { id: vmId } }],
    fetchWrapper(apiClient.vm[":id"].monitor.status.$get),
    {
      refreshInterval: 3000,
      fallbackData: {
        status: false,
      },
    },
  );

  // if (!serverData && !isLoading) {
  //   notFound();
  // }

  // if (error) {
  //   return (
  //     <>
  //       <div className="flex flex-col items-center justify-center">
  //         <p className="font-medium text-sm opacity-40">{error.message}</p>
  //         <p className="font-medium text-sm opacity-40">
  //           {t("detail_fetch_error_message")}
  //         </p>
  //       </div>
  //     </>
  //   );
  // }

  if (!vmInfo.data) return <ServerDetailLoading />;

  const { name, monitorInfo } = vmInfo.data;

  if (!monitorInfo) return <ServerDetailLoading />;

  return (
    <div>
      <div
        // onClick={linkClick}
        className="flex flex-none cursor-pointer items-center gap-0.5 break-all font-semibold text-xl leading-none tracking-tight transition-opacity duration-300 hover:opacity-50"
      >
        {/* <BackIcon /> */}
        {name}
      </div>
      <section className="mt-3 flex flex-wrap gap-2">
        <Card className="rounded-[10px] border-none bg-transparent shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-muted-foreground text-xs">{t("status")}</p>
              <Badge
                className={cn(
                  "-mt-[0.3px] w-fit rounded-[6px] px-1 py-0 text-[9px] dark:text-white",
                  {
                    " bg-green-800": status,
                    " bg-red-600": !status,
                  },
                )}
              >
                {status ? t("online") : t("offline")}
              </Badge>
            </section>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] border-none bg-transparent shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-muted-foreground text-xs">{t("uptime")}</p>
              <div className="text-xs">
                {" "}
                {/* {Number(monitorInfo.uptime) / 86400 >= 1
                  ? `${(Number(monitorInfo.uptime) / 86400).toFixed(0)} ${t("Days")}`
                  : `${(Number(monitorInfo.uptime) / 3600).toFixed(0)} ${t("Hours")}`} */}
              </div>
            </section>
          </CardContent>
        </Card>
        {monitorInfo.version && (
          <Card className="rounded-[10px] border-none bg-transparent shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-muted-foreground text-xs">{t("version")}</p>
                <div className="text-xs">{monitorInfo.version} </div>
              </section>
            </CardContent>
          </Card>
        )}
        {monitorInfo.arch && (
          <Card className="rounded-[10px] border-none bg-transparent shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-muted-foreground text-xs">{t("arch")}</p>
                <div className="text-xs">{monitorInfo.arch} </div>
              </section>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-[10px] border-none bg-transparent shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-muted-foreground text-xs">{t("memory")}</p>
              <div className="text-xs">{formatBytes(monitorInfo.memory)}</div>
            </section>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] border-none bg-transparent shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-muted-foreground text-xs">{t("disk")}</p>
              <div className="text-xs">{formatBytes(monitorInfo.disk)}</div>
            </section>
          </CardContent>
        </Card>
        {/* {country_code && (
          <Card className="rounded-[10px] border-none bg-transparent shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-muted-foreground text-xs">{t("Region")}</p>
                <section className="flex items-start gap-1">
                  <div className="text-start text-xs">
                    {countries.getName(country_code, "en")}
                  </div>
                  <ServerFlag
                    className="-mt-[1px] text-[11px]"
                    country_code={country_code}
                  />
                </section>
              </section>
            </CardContent>
          </Card>
        )} */}
      </section>
      <section className="mt-1 flex flex-wrap gap-2">
        {monitorInfo.platform && (
          <Card className="rounded-[10px] border-none bg-transparent shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-muted-foreground text-xs">{t("system")}</p>

                <div className="text-xs">
                  {" "}
                  {monitorInfo.platform} - {monitorInfo.platformVersion}{" "}
                </div>
              </section>
            </CardContent>
          </Card>
        )}
        {monitorInfo.cpu && monitorInfo.cpu.length > 0 && (
          <Card className="rounded-[10px] border-none bg-transparent shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-muted-foreground text-xs">{t("cpu")}</p>

                <div className="text-xs"> {monitorInfo.cpu[0]}</div>
                {/* <div className="text-xs"> {monitorInfo.cpu.join(", ")}</div> */}
              </section>
            </CardContent>
          </Card>
        )}
        {/* {monitorInfo.gpu && monitorInfo.gpu.length > 0 && (
          <Card className="rounded-[10px] border-none bg-transparent shadow-none">
            <CardContent className="px-1.5 py-1">
              <section className="flex flex-col items-start gap-0.5">
                <p className="text-muted-foreground text-xs">{"GPU"}</p>
                <div className="text-xs"> {gpu_info.join(", ")}</div>
              </section>
            </CardContent>
          </Card>
        )} */}
      </section>
      {/* <section className="mt-1 flex flex-wrap gap-2">
        <Card className="rounded-[10px] border-none bg-transparent shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-muted-foreground text-xs">{t("Load")}</p>
              <div className="text-xs">
                {monitorInfo.loadAvg.one || "0.00"} /{" "}
                {monitorInfo.loadAvg.five || "0.00"} /{" "}
                {monitorInfo.loadAvg.fifteen || "0.00"}
              </div>
            </section>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] border-none bg-transparent shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-muted-foreground text-xs">{t("Upload")}</p>
              {net_out_transfer ? (
                <div className="text-xs"> {formatBytes(net_out_transfer)} </div>
              ) : (
                <div className="text-xs">Unknown</div>
              )}
            </section>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] border-none bg-transparent shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-muted-foreground text-xs">{t("Download")}</p>
              {net_in_transfer ? (
                <div className="text-xs"> {formatBytes(net_in_transfer)} </div>
              ) : (
                <div className="text-xs">Unknown</div>
              )}
            </section>
          </CardContent>
        </Card>
      </section> */}
      {/* <section className="mt-1 flex flex-wrap gap-2">
        <Card className="rounded-[10px] border-none bg-transparent shadow-none">
          <CardContent className="px-1.5 py-1">
            <section className="flex flex-col items-start gap-0.5">
              <p className="text-muted-foreground text-xs">{t("LastActive")}</p>
              <div className="text-xs">
                {last_active_time_string ? last_active_time_string : "N/A"}
              </div>
            </section>
          </CardContent>
        </Card>
      </section> */}
    </div>
  );
}
