"use client";

// import { NetworkChartClient } from "@/components/monitor/network-chart";
// import ServerDetailChartClient from "@/components/monitor/server-detail-chart";
// import ServerDetailClient from "@/components/monitor/server-detail";
// import ServerIPInfo from "@/components/monitor/server-ip-info";
// import TabSwitch from "@/components/ui/tab-switch";
// import { Separator } from "@/components/ui/separator";

import { use } from "react";
import useMonitor from "@/hooks/use-monitor";
import {
  MetricsDataProvider,
  useMetricsData,
} from "@/components/monitor/vm-data-context";
import ServerDetail from "@/components/monitor/server-detail";
import { Separator } from "@/components/ui/separator";
import ServerDetailChartClient from "@/components/monitor/server-detail-chart";
import apiClient, { fetchWrapper } from "@/lib/api-client";
import useSWR from "swr";

type PageProps = {
  params: Promise<{ vmId: string }>;
};

// type TabType = "Detail" | "Network";

const ServerPage: React.FC<PageProps> = ({ params }: PageProps) => {
  const vmId = Number(use(params).vmId);
  const { addMetrics, addBatchMetrics } = useMetricsData();

  const { isConnected, startMonitorVM } = useMonitor({
    // vmIds: [vmId],
    onVMMetrics: (vmId, metrics) => {
      // console.log(metrics);
      addMetrics(vmId, metrics);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  useSWR(
    isConnected
      ? ["/api/vm/:id/monitor/metrics", { param: { id: vmId } }]
      : null,
    fetchWrapper(apiClient.vm[":id"].monitor.metrics.$get),
    {
      refreshInterval: 0,
      onSuccess: (data) => {
        addBatchMetrics(vmId, data);
        startMonitorVM([vmId]);
      },
    },
  );

  // const tabs: TabType[] = ["Detail", "Network"];
  // const [currentTab, setCurrentTab] = useState<TabType>(tabs[0]);

  // const tabContent = {
  //   Detail: (
  //     <ServerDetailChartClient
  //       server_id={serverId}
  //       show={currentTab === "Detail"}
  //     />
  //   ),
  //   Network: (
  //     <>
  //       {env.NEXT_PUBLIC_SHOW_IP_INFO && <ServerIPInfo server_id={serverId} />}
  //       <NetworkChartClient
  //         server_id={serverId}
  //         show={currentTab === "Network"}
  //       />
  //     </>
  //   ),
  // };

  return (
    <main className="mx-auto mt-16 grid w-full max-w-5xl gap-2">
      <ServerDetail vmId={vmId} />

      {/*<nav className="my-2 flex w-full items-center">
        <Separator className="flex-1" />

         <div className="flex w-full max-w-[200px] justify-center">
          <TabSwitch
            tabs={tabs}
            currentTab={currentTab}
            setCurrentTab={(tab: string) => setCurrentTab(tab as TabType)}
          />
        </div> 
        <Separator className="flex-1" />
      </nav>*/}

      <Separator className="my-2 flex-1" />
      <ServerDetailChartClient vmId={vmId} />
      {/* {tabContent[currentTab]} */}
    </main>
  );
};

export default function ServerPageWrapper(props: PageProps) {
  return (
    <MetricsDataProvider>
      <ServerPage {...props} />
    </MetricsDataProvider>
  );
}
