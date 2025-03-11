import type { Metrics } from "@/db/schema/metrics";
import type { MonitorVMInfo, VM } from "@/db/schema/vm";

export type ServerWithLiveMetrics = Pick<VM, "id" | "nickname"> & {
  vmInfo: MonitorVMInfo;
  metrics: Metrics;
};

export type ServerWithTimeSeriesMetrics = ServerWithLiveMetrics & {
  metrics: Metrics[];
};
