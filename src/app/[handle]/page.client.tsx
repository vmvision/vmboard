"use client";

import useMonitor from "@/hooks/use-monitor";
import {
  MetricsDataProvider,
  useMetricsData,
} from "@/components/monitor/vm-data-context";
import type { Page } from "@/db/schema/page";
import { ServerList } from "@/components/monitor/server-list-card";

type MonitorPageProps = {
  page: Page;
};

const MonitorPage = ({ page }: MonitorPageProps) => {
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
    <div className="container mx-auto">
      <ServerList
        // containerRef={containerRef}
        servers={page.vmIds.map((id) => ({ id, nickname: "test" }))}
      />
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
