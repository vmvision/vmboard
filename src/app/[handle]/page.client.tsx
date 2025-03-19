"use client";

import useMonitor from "@/hooks/use-monitor";
import {
  MetricsDataProvider,
  useMetricsData,
} from "@/components/monitor/vm-data-context";
import type { Page } from "@/db/schema/page";
import { ServerList } from "@/components/monitor/server-list-card";
import type { VM } from "@/db/schema/vm";

export type MonitorVM = Pick<VM, "id" | "nickname"> & {
  os?: string;
  osVersion?: string;
  platform?: string;
  platformVersion?: string;
};

type MonitorPageProps = {
  page: Pick<Page, "id" | "title" | "description"> & {
    vms: MonitorVM[];
  };
};

const MonitorPage = ({ page }: MonitorPageProps) => {
  const { metrics, addMetrics } = useMetricsData();

  const { isConnected, montoringVmIds } = useMonitor({
    vmIds: page.vms.map((vm) => vm.id),
    onVMMetrics: (vmId, metrics) => {
      addMetrics(vmId, metrics);
    },
    onEvent: (event) => {
      console.log(event);
    },
  });

  return (
    <div className="container mx-auto mt-16">
      <ServerList servers={page.vms} />
    </div>
  );
};

export default function MonitorPageWrapper(props: MonitorPageProps) {
  return (
    <MetricsDataProvider>
      <MonitorPage {...props} />
    </MetricsDataProvider>
  );
}
