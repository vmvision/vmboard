import { MonitorVMInfo } from "@/db/schema/vm";

export interface StartMonitorEvent {
  type: "startMonitor";
  data:
    | {
        hostname: string;
      }
    | {
        pageHandle: string;
      }
    | {
        vmIds: number[];
      };
}

export interface GetMonitorMetricsEvent {
  type: "getMonitorMetrics";
  data: {
    vmIds: number[];
  };
}

export type MonitorUserClientEvent = StartMonitorEvent | GetMonitorMetricsEvent;

export interface VMReportEvent {
  type: "report";
  data: {
    uptime: number;
    system: SystemInfo;
    network: NetworkInfo;
    disk: DiskInfo;
  };
}

interface SystemInfo {
  cpuUsage: number;
  memoryUsed: number;
  memoryTotal: number;
  swapUsed: number;
  swapTotal: number;
  processCount: number;
  loadAvg: {
    one: number;
    five: number;
    fifteen: number;
  };
}

interface DiskInfo {
  spaceUsed: number;
  spaceTotal: number;
  read: number;
  write: number;
}

interface NetworkInfo {
  downloadTraffic: number;
  uploadTraffic: number;
  tcpCount: number;
  udpCount: number;
}

export interface VMInfoEvent {
  type: "vm_info";
  data: MonitorVMInfo;
}

export type MonitorServerClientEvent = VMReportEvent | VMInfoEvent;
