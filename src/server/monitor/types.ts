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

export type MonitorUserClientEvent = StartMonitorEvent;
