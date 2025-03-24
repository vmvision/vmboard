import type { MonitorVMInfo } from "@/db/schema/vm";
import type { Session } from "@/lib/auth";
import type { UUIDTypes } from "uuid";
import type { WebSocket as _WebSocket } from "ws";
export type SocketIdentifier = UUIDTypes;
export type VMIdentifier = number;

export type WebSocket = _WebSocket & {
  id: SocketIdentifier;
};
export interface VMWebSocket extends WebSocket {
  vmId: number;
  token: string;
}
export interface MonitorWebSocket extends WebSocket {
  session: Session | null;
  listenVmIds: VMIdentifier[];
}
export interface StartMonitorEvent {
  type: "startMonitor";
  data:
    | {
        pageId: number;
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
  type: "metrics";
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
