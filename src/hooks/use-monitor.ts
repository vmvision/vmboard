import type { Monitor } from "@/db/schema/monitor";
import { unpack, pack } from "msgpackr";
import { useEffect, useState, useRef } from "react";

export interface MetricsEvent {
  type: "metrics";
  data: {
    vmId: number;
    metrics: Monitor;
  };
}

export interface StartMonitorEvent {
  type: "monitoring";
  data: {
    vmIds: number[];
  };
}

export type MonitorEvent = MetricsEvent | StartMonitorEvent;

export interface MonitorProps {
  pageHandle?: string;

  onVMMetrics?: (vmId: number, metrics: Monitor) => void;
  onEvent?: (event: MonitorEvent) => void;
  onError?: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface MonitorResult {
  isConnected: boolean;
  montoringVmIds: number[];
  startMonitorVM: (vmIds: number[]) => void;
  stopMonitorVM: (vmIds: number[]) => void;
  startMonitorPage: (pageHandle: string) => void;
}

export default function useMonitor({
  pageHandle,
  onVMMetrics,
  onEvent,
  onError,
  onOpen,
  onClose,
}: MonitorProps): MonitorResult {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [montoringVmIds, setMontoringVmIds] = useState<number[]>([]);

  const startMonitorPage = (pageHandle: string) => {
    if (!ws.current) {
      throw new Error("WebSocket is not connected");
    }

    ws.current.send(pack({ type: "startMonitor", data: { pageHandle } }));
  };

  const startMonitorVM = (vmIds: number[]) => {
    if (!ws.current) {
      throw new Error("WebSocket is not connected");
    }

    ws.current.send(pack({ type: "startMonitor", data: { vmIds } }));
  };

  const stopMonitorVM = (vmIds: number[]) => {
    if (!ws.current) {
      throw new Error("WebSocket is not connected");
    }

    ws.current.send(pack({ type: "stopMonitor", data: { vmIds } }));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: should not changed
  useEffect(() => {
    const newWs = new WebSocket(
      `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/wss/monitor/user`,
    );

    newWs.onopen = () => {
      setIsConnected(true);
      onOpen?.();
      if (pageHandle) {
        startMonitorPage(pageHandle);
      }
    };

    newWs.onmessage = (event) => {
      const data = unpack(event.data) as MonitorEvent;
      onEvent?.(data);
      if (data.type === "metrics") {
        if (onVMMetrics) {
          onVMMetrics(data.data.vmId, data.data.metrics);
        }
      } else if (data.type === "monitoring") {
        setMontoringVmIds(data.data.vmIds);
      }
    };

    newWs.onclose = () => {
      setIsConnected(false);
      onClose?.();
    };

    newWs.onerror = () => {
      onError?.(new Error("WebSocket error occurred"));
    };

    ws.current = newWs;

    return () => {
      newWs.close();
    };
  }, []);

  return {
    isConnected,
    startMonitorVM,
    stopMonitorVM,
    montoringVmIds,
    startMonitorPage,
  };
}
