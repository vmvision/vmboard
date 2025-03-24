import type { Metrics } from "@/db/schema/metrics";
import { unpack, pack } from "msgpackr";
import { useEffect, useState, useRef } from "react";

export interface MetricsEvent {
  type: "liveMetrics";
  data: {
    vmId: number;
    metrics: Metrics;
  };
}

export interface StartMonitorEvent {
  type: "monitoring";
  data: {
    vmIds: number[];
  };
}

export interface MonitorMetricsEvent {
  type: "monitorMetrics";
  data: {
    vmIds: number[];
  };
}

export type MonitorEvent =
  | MetricsEvent
  | StartMonitorEvent
  | MonitorMetricsEvent;

export interface MonitorProps {
  vmIds?: number[];
  pageHandle?: string;

  onVMMetrics?: (vmId: number, metrics: Metrics) => void;
  onEvent?: (event: MonitorEvent) => void;
  onError?: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface MonitorResult {
  isConnected: boolean;
  montoringVmIds: number[];
  getMonitorMetrics: (vmIds: number[]) => void;
  startMonitorVM: (vmIds: number[]) => void;
  stopMonitorVM: (vmIds: number[]) => void;
  startMonitorPage: (pageHandle: string) => void;
}

export default function useMonitor({
  vmIds,
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

  const getMonitorMetrics = (vmIds: number[]) => {
    if (!ws.current) {
      throw new Error("WebSocket is not connected");
    }

    ws.current.send(pack({ type: "getMonitorMetrics", data: { vmIds } }));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: should not changed
  useEffect(() => {
    const newWs = new WebSocket(
      `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/wss/monitor`,
    );

    newWs.onopen = () => {
      setIsConnected(true);
      onOpen?.();
      if (vmIds) {
        startMonitorVM(vmIds);
      }
      if (pageHandle) {
        startMonitorPage(pageHandle);
      }
    };

    newWs.onmessage = async (event) => {
      const data = event.data instanceof Blob 
        ? unpack(await new Uint8Array(await event.data.arrayBuffer())) as MonitorEvent
        : unpack(event.data) as MonitorEvent;
      onEvent?.(data);
      if (data.type === "monitorMetrics") {
        getMonitorMetrics(data.data.vmIds);
      } else if (data.type === "liveMetrics") {
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
    getMonitorMetrics,
    startMonitorVM,
    stopMonitorVM,
    montoringVmIds,
    startMonitorPage,
  };
}