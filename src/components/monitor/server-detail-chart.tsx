/*
 * This file is based on code from the nezha-dash project,
 * originally licensed under the Apache License 2.0.
 * The original license can be found in the LICENSE-APACHE file.
 *
 * Modifications made by AprilNEA <github@sku.moe>
 * Derived from: https://github.com/hamster1963/nezha-dash/raw/ac15be6e71ba9804681b1fe760fa245f94912372/app/(main)/ClientComponents/detail/ServerDetailChartClient.tsx
 * Licensed under the GNU General Public License v3.0 (GPLv3).
 */
"use client";

import { ServerDetailChartLoading } from "@/components/monitor/server-detail-loading";
import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar";
import { Card, CardContent } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { formatBytes, formatRelativeTime } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { type DerivedMetrics, useMetricsData } from "./vm-data-context";

interface ServerDetailChartClientProps {
  vmId: number;
}

export default function ServerDetailChartClient({
  vmId,
}: ServerDetailChartClientProps) {
  const { getMetrics } = useMetricsData();
  const data = getMetrics(vmId);

  // if (error) {
  //   return (
  //     <>
  //       <div className="flex flex-col items-center justify-center">
  //         <p className="font-medium text-sm opacity-40">{error.message}</p>
  //         <p className="font-medium text-sm opacity-40">
  //           {t("chart_fetch_error_message")}
  //         </p>
  //       </div>
  //     </>
  //   );
  // }
  if (!data) return <ServerDetailChartLoading />;

  return (
    <section className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      <CpuChart data={data} />
      <ProcessCountChart data={data} />
      <DiskChart data={data} />
      <MemoryChart data={data} />
      <NetworkChart data={data} />
      <ConnectionsChart data={data} />
    </section>
  );
}

interface ChartProps {
  data: DerivedMetrics[];
}

function CpuChart({ data }: ChartProps) {
  const t = useTranslations("Public.VM");

  const current = data[data.length - 1] ||
    data[0] || {
      cpuUsage: 0,
    };

  const chartConfig = {
    cpuUsage: {
      label: "cpuUsage",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardContent className="px-6 py-3">
        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-md">{t("cpu")}</p>
            <section className="flex items-center gap-2">
              <p className="w-10 text-end font-medium text-xs">
                {Number(current.cpuUsage).toFixed(0)}%
              </p>
              <AnimatedCircularProgressBar
                className="size-3 text-[0px]"
                max={100}
                min={0}
                value={Number(current.cpuUsage)}
                primaryColor="hsl(var(--chart-1))"
              />
            </section>
          </div>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[130px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{
                top: 12,
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={200}
                interval="preserveStartEnd"
                tickFormatter={(value) => formatRelativeTime(value)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                mirror={true}
                tickMargin={-15}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Area
                isAnimationActive={false}
                dataKey="cpuUsage"
                type="step"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.3}
                stroke="hsl(var(--chart-1))"
              />
            </AreaChart>
          </ChartContainer>
        </section>
      </CardContent>
    </Card>
  );
}

function ProcessCountChart({ data }: ChartProps) {
  const t = useTranslations("Public.VM");

  const current = data[data.length - 1] ||
    data[0] || {
      processCount: 0,
    };

  const chartConfig = {
    processCount: {
      label: "processCount",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardContent className="px-6 py-3">
        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-md">{t("process")}</p>
            <section className="flex items-center gap-2">
              <p className="w-10 text-end font-medium text-xs">
                {current.processCount}
              </p>
            </section>
          </div>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[130px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{
                top: 12,
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={200}
                interval="preserveStartEnd"
                tickFormatter={(value) => formatRelativeTime(value)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                mirror={true}
                tickMargin={-15}
              />
              <Area
                isAnimationActive={false}
                dataKey="processCount"
                type="step"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.3}
                stroke="hsl(var(--chart-2))"
              />
            </AreaChart>
          </ChartContainer>
        </section>
      </CardContent>
    </Card>
  );
}

function MemoryChart({ data }: ChartProps) {
  const t = useTranslations("Public.VM");

  const current = data[data.length - 1] ||
    data[0] || {
      memoryUsed: 0,
      memoryTotal: 0,
      swapUsed: 0,
      swapTotal: 0,
      memoryUsage: 0,
      swapUsage: 0,
    };
  const chartConfig = {
    memoryUsage: {
      label: "Mem",
    },
    swapUsage: {
      label: "Swap",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardContent className="px-6 py-3">
        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <section className="flex items-center gap-4">
              <div className="flex flex-col">
                <p className=" text-muted-foreground text-xs">{t("memory")}</p>
                <div className="flex items-center gap-2">
                  <AnimatedCircularProgressBar
                    className="size-3 text-[0px]"
                    max={100}
                    min={0}
                    value={current.memoryUsage}
                    primaryColor="hsl(var(--chart-8))"
                  />
                  <p className="font-medium text-xs">
                    {current.memoryUsage.toFixed(0)}%
                  </p>
                </div>
              </div>
              <div className="flex flex-col">
                <p className=" text-muted-foreground text-xs">{t("swap")}</p>
                <div className="flex items-center gap-2">
                  <AnimatedCircularProgressBar
                    className="size-3 text-[0px]"
                    max={100}
                    min={0}
                    value={current.swapUsage}
                    primaryColor="hsl(var(--chart-10))"
                  />
                  <p className="font-medium text-xs">
                    {current.swapUsage.toFixed(0)}%
                  </p>
                </div>
              </div>
            </section>
            <section className="flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-2 font-medium text-[11px]">
                {formatBytes(current.memoryUsed)} /{" "}
                {formatBytes(current.memoryTotal)}
              </div>
              <div className="flex items-center gap-2 font-medium text-[11px]">
                {formatBytes(current.swapUsed)} /{" "}
                {formatBytes(current.swapTotal)}
              </div>
            </section>
          </div>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[130px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{
                top: 12,
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={200}
                interval="preserveStartEnd"
                tickFormatter={(value) => formatRelativeTime(value)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                mirror={true}
                tickMargin={-15}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Area
                isAnimationActive={false}
                dataKey="memoryUsage"
                type="step"
                fill="hsl(var(--chart-8))"
                fillOpacity={0.3}
                stroke="hsl(var(--chart-8))"
              />
              <Area
                isAnimationActive={false}
                dataKey="swapUsage"
                type="step"
                fill="hsl(var(--chart-10))"
                fillOpacity={0.3}
                stroke="hsl(var(--chart-10))"
              />
            </AreaChart>
          </ChartContainer>
        </section>
      </CardContent>
    </Card>
  );
}

function DiskChart({ data }: ChartProps) {
  const t = useTranslations("Public.VM");

  const current = data[data.length - 1] ||
    data[0] || {
      diskUsed: 0,
      diskTotal: 0,
      diskUsage: 0,
      diskReadSpeed: 0,
      diskWriteSpeed: 0,
    };

  const chartConfig = {
    disk: {
      label: "Disk",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardContent className="px-6 py-3">
        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-md">{t("disk")}</p>
            <section className="flex flex-col items-end gap-0.5">
              <section className="flex items-center gap-2">
                <p className="w-10 text-end font-medium text-xs">
                  {current.diskUsage.toFixed(0)}%
                </p>
                <AnimatedCircularProgressBar
                  className="size-3 text-[0px]"
                  max={100}
                  min={0}
                  value={current.diskUsage}
                  primaryColor="hsl(var(--chart-5))"
                />
              </section>
              <div className="flex items-center gap-2 font-medium text-[11px]">
                {formatBytes(current.diskUsed)} /{" "}
                {formatBytes(current.diskTotal)}
              </div>
            </section>
          </div>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[130px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{
                top: 12,
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={200}
                interval="preserveStartEnd"
                tickFormatter={(value) => formatRelativeTime(value)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                mirror={true}
                tickMargin={-15}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Area
                isAnimationActive={false}
                dataKey="diskUsage"
                type="step"
                fill="hsl(var(--chart-5))"
                fillOpacity={0.3}
                stroke="hsl(var(--chart-5))"
              />
            </AreaChart>
          </ChartContainer>
        </section>
      </CardContent>
    </Card>
  );
}

function NetworkChart({ data }: ChartProps) {
  const t = useTranslations("Public.VM");

  const current = data[data.length - 1] ||
    data[0] || {
      networkInSpeed: 0,
      networkOutSpeed: 0,
    };
  // let maxDownload = Math.max(...networkChartData.map((item) => item.download));
  // maxDownload = Math.ceil(maxDownload);
  // if (maxDownload < 1) {
  //   maxDownload = 1;
  // }

  const chartConfig = {
    networkInSpeed: {
      label: "Upload",
    },
    networkOutSpeed: {
      label: "Download",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardContent className="px-6 py-3">
        <section className="flex flex-col gap-1">
          <div className="flex items-center">
            <section className="flex items-center gap-4">
              <div className="flex w-20 flex-col">
                <p className="text-muted-foreground text-xs">{t("totalUpload")}</p>
                <div className="flex items-center gap-1">
                  <span className="relative inline-flex size-1.5 rounded-full bg-[hsl(var(--chart-1))]" />
                  <p className="font-medium text-xs">
                    {current.networkInSpeed.toFixed(2)} M/s
                  </p>
                </div>
              </div>
              <div className="flex w-20 flex-col">
                <p className=" text-muted-foreground text-xs">
                  {t("totalDownload")}
                </p>
                <div className="flex items-center gap-1">
                  <span className="relative inline-flex size-1.5 rounded-full bg-[hsl(var(--chart-4))]" />
                  <p className="font-medium text-xs">
                    {current.networkOutSpeed.toFixed(2)} M/s
                  </p>
                </div>
              </div>
            </section>
          </div>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[130px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={data}
              margin={{
                top: 12,
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="timeStamp"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={200}
                interval="preserveStartEnd"
                tickFormatter={(value) => formatRelativeTime(value)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                mirror={true}
                tickMargin={-15}
                type="number"
                minTickGap={50}
                interval="preserveStartEnd"
                // domain={[1, maxDownload]}
                tickFormatter={(value) => `${value.toFixed(0)}M/s`}
              />
              <Line
                isAnimationActive={false}
                dataKey="networkInSpeed"
                type="linear"
                stroke="hsl(var(--chart-1))"
                strokeWidth={1}
                dot={false}
              />
              <Line
                isAnimationActive={false}
                dataKey="networkOutSpeed"
                type="linear"
                stroke="hsl(var(--chart-4))"
                strokeWidth={1}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </section>
      </CardContent>
    </Card>
  );
}

function ConnectionsChart({ data }: ChartProps) {
  const t = useTranslations("Public.VM");

  const current = data[data.length - 1] ||
    data[0] || {
      tcpConnections: 0,
      udpConnections: 0,
    };

  const chartConfig = {
    tcpConnections: {
      label: "TCP",
    },
    udpConnections: {
      label: "UDP",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardContent className="px-6 py-3">
        <section className="flex flex-col gap-1">
          <div className="flex items-center">
            <section className="flex items-center gap-4">
              <div className="flex w-12 flex-col">
                <p className="text-muted-foreground text-xs">{t("tcp")}</p>
                <div className="flex items-center gap-1">
                  <span className="relative inline-flex size-1.5 rounded-full bg-[hsl(var(--chart-1))]" />
                  <p className="font-medium text-xs">
                    {current.tcpConnections}
                  </p>
                </div>
              </div>
              <div className="flex w-12 flex-col">
                <p className=" text-muted-foreground text-xs">{t("udp")}</p>
                <div className="flex items-center gap-1">
                  <span className="relative inline-flex size-1.5 rounded-full bg-[hsl(var(--chart-4))]" />
                  <p className="font-medium text-xs">
                    {current.udpConnections}
                  </p>
                </div>
              </div>
            </section>
          </div>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[130px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={data}
              margin={{
                top: 12,
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={200}
                interval="preserveStartEnd"
                tickFormatter={(value) => formatRelativeTime(value)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                mirror={true}
                tickMargin={-15}
                type="number"
                interval="preserveStartEnd"
              />
              <Line
                isAnimationActive={false}
                dataKey="tcpConnections"
                type="linear"
                stroke="hsl(var(--chart-1))"
                strokeWidth={1}
                dot={false}
              />
              <Line
                isAnimationActive={false}
                dataKey="udpConnections"
                type="linear"
                stroke="hsl(var(--chart-4))"
                strokeWidth={1}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </section>
      </CardContent>
    </Card>
  );
}
