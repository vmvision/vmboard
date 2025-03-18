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
      const prevMetricsArray = prev[vmId] || [];
      const previousMetrics = prevMetricsArray[prevMetricsArray.length - 1] || prevMetricsArray[0];

      if (prevMetricsArray.length < 1 || !previousMetrics) {
        return {
          ...prev,
          [vmId]: [
            ...prevMetricsArray,
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

      if (prevMetricsArray.length > maxLengthRef.current) {
        prevMetricsArray.shift();
      }

      return {
        ...prev,
        [vmId]: [
          ...prevMetricsArray,
          {
            ...metrics,
            memoryUsage:
              (Number(metrics.memoryUsed) / Number(metrics.memoryTotal)) * 100,
            swapUsage:
              (Number(metrics.swapUsed) / Number(metrics.swapTotal)) * 100,
            diskUsage:
              (Number(metrics.diskUsed) / Number(metrics.diskTotal)) * 100,
            networkInSpeed:
              (Number(metrics.networkIn) - Number(previousMetrics.networkIn)) /
              1024,
            networkOutSpeed:
              (Number(metrics.networkOut) - Number(previousMetrics.networkOut)) /
              1024,
            diskReadSpeed:
              (Number(metrics.diskRead) - Number(previousMetrics.diskRead)) / 1024,
            diskWriteSpeed:
              (Number(metrics.diskWrite) - Number(previousMetrics.diskWrite)) /
              1024,
          },
        ],
      };
    });
  };

  const addBatchMetrics = (vmId: number, metrics: Metrics[]) => {
    setMetrics((prev) => {
      const currentMetrics = prev[vmId] || [];

      for (const [index, metric] of metrics.entries()) {
        const previousMetrics =
          index > 0
            ? currentMetrics[index - 1]
            : currentMetrics.length > 1
              ? currentMetrics[currentMetrics.length - 1]
              : currentMetrics[0];

        const newMetric = {
          ...metric,
          memoryUsage:
            (Number(metric.memoryUsed) / Number(metric.memoryTotal)) * 100,
          swapUsage: (Number(metric.swapUsed) / Number(metric.swapTotal)) * 100,
          diskUsage: (Number(metric.diskUsed) / Number(metric.diskTotal)) * 100,
          networkInSpeed: previousMetrics
            ? (Number(metric.networkIn) - Number(previousMetrics.networkIn)) /
              1024
            : 0,
          networkOutSpeed: previousMetrics
            ? (Number(metric.networkOut) - Number(previousMetrics.networkOut)) /
              1024
            : 0,
          diskReadSpeed: previousMetrics
            ? (Number(metric.diskRead) - Number(previousMetrics.diskRead)) /
              1024
            : 0,
          diskWriteSpeed: previousMetrics
            ? (Number(metric.diskWrite) - Number(previousMetrics.diskWrite)) /
              1024
            : 0,
        };

        currentMetrics.push(newMetric);
        if (currentMetrics.length > maxLengthRef.current) {
          currentMetrics.shift();
        }
      }

      return {
        ...prev,
        [vmId]: currentMetrics,
      };
    });
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
