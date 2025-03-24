import type http from "node:http";
import { vm as vmTable } from "@/db/schema/vm";
import { eq } from "drizzle-orm";
import { WebSocketServer } from "ws";
import db from "@/db";
import { metrics as metricsTable } from "@/db/schema/metrics";
import { pack } from "msgpackr";
import type { MonitorServerClientEvent, VMWebSocket } from "./types";
import { parseMsgPack } from "./utils";
import { v4 as uuid } from "uuid";
import { socketManager } from "./manager/socket";
import { vmManager } from "./manager/vm-manager";
import { monitorManager } from "./manager/monitor-manager";

const WSS_PATHNAME = "/wss/master";
export function setupMasterWebSocketServer(
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
) {
  const wssTerm = new WebSocketServer({
    noServer: true,
  });
  server.on("upgrade", async (req, socket, head) => {
    const { pathname, searchParams } = new URL(
      req.url ?? "/",
      `http://${req.headers.host ?? "localhost"}`,
    );
    if (pathname !== WSS_PATHNAME) return;
    socket.on("error", (err) => {
      console.error(err);
    });
    const unauthenticated = (message?: string) => {
      socket.write(`HTTP/1.1 401 Unauthorized\r\n\r\n${message ?? ""}`);
      socket.destroy();
      return;
    };
    try {
      const token = searchParams.get("secret");
      if (!token) return unauthenticated("No token");
      const vm = await db.query.vm.findFirst({
        where: eq(vmTable.token, token),
      });
      if (!vm) return unauthenticated("VM not found");
      wssTerm.handleUpgrade(req, socket, head, function done(ws) {
        const vmWs = ws as unknown as VMWebSocket;
        vmWs.vmId = vm.id;
        vmWs.token = vm.token;
        vmWs.id = uuid();
        socketManager.addSocket(vmWs.id, vmWs);
        vmManager.addSocket(vm.id, vmWs.id);
        wssTerm.emit("connection", vmWs, req);
      });
    } catch (error) {
      unauthenticated(`Error upgrading: ${error}`);
    }
  });

  wssTerm.on("connection", async (vmWs: VMWebSocket) => {
    vmWs.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
    vmWs.on("close", () => {
      socketManager.removeSocket(vmWs.id);
      vmManager.removeSocket(vmWs.vmId);
    });
    vmWs.on("message", async (data) => {
      try {
        const message = parseMsgPack(data) as MonitorServerClientEvent;
        if (typeof message !== "object" || message === null || !message?.type) {
          throw new Error("Invalid message");
        }
        switch (message.type) {
          case "metrics": {
            const data = message.data;
            const metrics = (
              await db
                .insert(metricsTable)
                .values({
                  vmId: vmWs.vmId,
                  uptime: data.uptime,
                  cpuUsage: data.system.cpuUsage,
                  processCount: data.system.processCount,
                  memoryUsed: data.system.memoryUsed,
                  memoryTotal: data.system.memoryTotal,
                  swapUsed: data.system.swapUsed,
                  swapTotal: data.system.swapTotal,
                  diskUsed: data.disk.spaceUsed,
                  diskTotal: data.disk.spaceTotal,
                  diskRead: data.disk.read,
                  diskWrite: data.disk.write,
                  networkIn: data.network.uploadTraffic,
                  networkOut: data.network.downloadTraffic,
                  tcpConnections: data.network.tcpCount,
                  udpConnections: data.network.udpCount,
                  load1: data.system.loadAvg.one,
                  load5: data.system.loadAvg.five,
                  load15: data.system.loadAvg.fifteen,
                })
                .returning()
            )?.[0];
            monitorManager.broadcast(vmWs.vmId, {
              type: "liveMetrics",
              data: {
                vmId: vmWs.vmId,
                metrics,
              },
            });
            break;
          }
          // case "ip_report": {
          // }
          case "vm_info": {
            const data = message.data;
            await db
              .update(vmTable)
              .set({
                monitorInfo: data,
              })
              .where(eq(vmTable.id, vmWs.vmId));
            break;
          }
          default:
            throw new Error(`Unknown message type: ${message.type}`);
        }
      } catch (error) {
        console.error("Error processing message:", error);
        vmWs.send(
          pack({
            type: "error",
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          }),
        );
      }
    });
  });
}
