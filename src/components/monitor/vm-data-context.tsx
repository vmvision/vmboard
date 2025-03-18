import type { Metrics } from "@/db/schema/metrics";
import type React from "react";
import { createContext, useContext, useRef, useState } from "react";

export type DerivedMetrics = Metrics & {
  memoryUsage: number;
  swapUsage: number;
  diskUsage: number;
  networkInSpeed: number;
  networkOutSpeed: number;
  diskReadSpeed: number;
  diskWriteSpeed: number;
};

type MetricsData = Record<number, DerivedMetrics[]>;

interface MetricsDataContextType {
  metrics: MetricsData;
  getMetrics: (vmId: number) => DerivedMetrics[];
  getLatestMetrics: (vmId: number) => DerivedMetrics | undefined;
  addMetrics: (vmId: number, metrics: Metrics) => void;
  addBatchMetrics: (vmId: number, metrics: Metrics[]) => void;
}

const MetricsDataContext = createContext<MetricsDataContextType | null>(null);

export const useMetricsData = () => {
  const context = useContext(MetricsDataContext);
  if (!context) {
    throw new Error("useMetricsData must be used within a MetricsDataProvider");
  }
  return context;
};

export const MetricsDataProvider: React.FC<{
  children: React.ReactNode;
  maxLength?: number;
}> = ({ children, maxLength = 20 }) => {
  const maxLengthRef = useRef(maxLength);

  const [metrics, setMetrics] = useState<MetricsData>({});

  const getMetrics = (vmId: number) => {
    return metrics[vmId] || [];
  };

  const getLatestMetrics = (vmId: number) => {
    const allMetrics = getMetrics(vmId);
    return allMetrics[allMetrics.length - 1] || allMetrics[0];
  };

  const addMetrics = (vmId: number, metrics: Metrics) => {
    setMetrics((prev) => {
      const prevMetrics = prev[vmId] || [];
      const lastMetrics = prevMetrics[prevMetrics.length - 1] || prevMetrics[0];

      if (prevMetrics.length < 1 || !lastMetrics) {
        return {
          ...prev,
          [vmId]: [
            ...prevMetrics,
            {
              ...metrics,
              memoryUsage:
                (Number(metrics.memoryUsed) / Number(metrics.memoryTotal)) *
                100,
              swapUsage:
                (Number(metrics.swapUsed) / Number(metrics.swapTotal)) * 100,
              diskUsage:
                (Number(metrics.diskUsed) / Number(metrics.diskTotal)) * 100,
              networkInSpeed: 0,
              networkOutSpeed: 0,
              diskReadSpeed: 0,
              diskWriteSpeed: 0,
            },
          ],
        };
      }
      if (prevMetrics.length > maxLengthRef.current) {
        prevMetrics.shift();
      }
      return {
        ...prev,
        [vmId]: [
          ...prevMetrics,
          {
            ...metrics,
            memoryUsage:
              (Number(metrics.memoryUsed) / Number(metrics.memoryTotal)) * 100,
            swapUsage:
              (Number(metrics.swapUsed) / Number(metrics.swapTotal)) * 100,
            diskUsage:
              (Number(metrics.diskUsed) / Number(metrics.diskTotal)) * 100,
            networkInSpeed:
              (Number(metrics.networkIn) - Number(lastMetrics.networkIn)) /
              1024,
            networkOutSpeed:
              (Number(metrics.networkOut) - Number(lastMetrics.networkOut)) /
              1024,
            diskReadSpeed:
              (Number(metrics.diskRead) - Number(lastMetrics.diskRead)) / 1024,
            diskWriteSpeed:
              (Number(metrics.diskWrite) - Number(lastMetrics.diskWrite)) /
              1024,
          },
        ],
      };
    });
  };

  const addBatchMetrics = (vmId: number, metrics: Metrics[]) => {
    for (const metric of metrics) {
      addMetrics(vmId, metric);
    }
  };

  return (
    <MetricsDataContext.Provider
      value={{
        metrics,
        getMetrics,
        getLatestMetrics,
        addMetrics,
        addBatchMetrics,
      }}
    >
      {children}
    </MetricsDataContext.Provider>
  );
};
