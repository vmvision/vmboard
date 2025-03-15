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
  monitorInfo: {
    os?: string;
    osVersion?: string;
    platform?: string;
    platformVersion?: string;
  };
};

type MonitorPageProps = {
  page: Page;
  vms: MonitorVM[];
};

const MonitorPage = ({ page, vms }: MonitorPageProps) => {
  const { metrics, addMetrics } = useMetricsData();

  const { isConnected, montoringVmIds } = useMonitor({
    vmIds: page.vmIds,
    onVMMetrics: (vmId, metrics) => {
      addMetrics(vmId, metrics);
    },
    onEvent: (event) => {
      console.log(event);
    },
  });

  return (
    <div className="container mx-auto mt-16">
      <ServerList servers={vms} />
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
