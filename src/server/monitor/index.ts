import type http from "node:http";
import { vm as vmTable } from "@/db/schema/vm";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { WebSocket, WebSocketServer } from "ws";
import db from "@/db";
import { metrics as metricsTable } from "@/db/schema/metrics";
import { auth, type Session } from "@/lib/auth";
import { pack } from "msgpackr";
import type { MonitorServerClientEvent, MonitorUserClientEvent } from "./types";
import { parseMsgPack } from "./utils";
import { page as pageTable } from "@/db/schema/page";
import { addVmSocket, removeVmSocket, type VMWebSocket } from "./socket";

interface UserWebSocket extends WebSocket {
  session: Session | null;
}

const vmListenerMap = new Map<number, UserWebSocket[]>();

// export const broadcastToAll = (message: unknown) => {
//   const messageStr = JSON.stringify(message);
//   for (const socket of vmSocketMap.values()) {
//     if (socket.readyState === WebSocket.OPEN) {
//       socket.send(messageStr);
//     }
//   }
// };

export const addVMListener = (vmId: number, listener: UserWebSocket) => {
  const existingListeners = vmListenerMap.get(vmId) ?? [];
  const uniqueListeners = [...new Set([...existingListeners, listener])];
  vmListenerMap.set(vmId, uniqueListeners);
};

// Remove user websocket from all VM listeners
export const removeVMListener = (listener: UserWebSocket) => {
  for (const listeners of vmListenerMap.values()) {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
};

export const boardcastToUser = (vmId: number, message: unknown) => {
  const vmListeners = vmListenerMap.get(vmId) ?? [];
  for (const listener of vmListeners) {
    if (listener.readyState === WebSocket.OPEN) {
      listener.send(pack(message));
    } else if (
      listener.readyState === WebSocket.CLOSED ||
      listener.readyState === WebSocket.CLOSING
    ) {
      const index = vmListeners.indexOf(listener);
      if (index !== -1) {
        vmListeners.splice(index, 1);
      }
    }
  }
};

export const setupMonitorWebSocketServer = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
) => {
  const wssTerm = new WebSocketServer({
    noServer: true,
  });

  server.on("upgrade", async (req, socket, head) => {
    const { pathname, searchParams } = new URL(
      req.url ?? "/",
      `http://${req.headers.host ?? "localhost"}`,
    );

    if (!pathname.startsWith("/wss/monitor")) {
      return;
    }

    socket.on("error", (err) => {
      console.error(err);
    });

    const unauthenticated = () => {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    };
    if (pathname === "/wss/monitor") {
      try {
        const token = searchParams.get("auth_secret");
        if (!token) {
          console.error("No token");
          unauthenticated();
          return;
        }
        const vm = await db.query.vm.findFirst({
          where: eq(vmTable.token, token),
        });
        if (!vm) {
          console.error("VM not found. Token: ", token);
          unauthenticated();
          return;
        }
        wssTerm.handleUpgrade(req, socket, head, function done(ws) {
          const vmWs = ws as unknown as VMWebSocket;
          vmWs.vmId = vm.id;
          vmWs.token = vm.token;
          wssTerm.emit("connection", vmWs, req);
        });
      } catch (error) {
        console.error("Error upgrading:", error);
        unauthenticated();
      }
    }
    if (pathname === "/wss/monitor/user") {
      const session = await auth.api.getSession({
        headers: new Headers(req.headers as Record<string, string>),
      });
      wssTerm.handleUpgrade(req, socket, head, function done(ws) {
        const userWs = ws as UserWebSocket;
        userWs.session = session;
        wssTerm.emit("connection", userWs, req);
      });
    }
  });

  wssTerm.on("connection", async (ws, req) => {
    const { hostname, pathname } = new URL(
      req.url ?? "/",
      `http://${req.headers.host ?? "localhost"}`,
    );

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
    });

    if (pathname === "/wss/monitor") {
      const vmWs = ws as unknown as VMWebSocket;
      addVmSocket(vmWs.vmId, vmWs);
      vmWs.on("close", () => {
        removeVmSocket(vmWs.vmId);
      });
      vmWs.on("message", async (data) => {
        try {
          const message = parseMsgPack(data) as MonitorServerClientEvent;
          if (
            typeof message !== "object" ||
            message === null ||
            !message?.type
          ) {
            throw new Error("Invalid message");
          }
          switch (message.type) {
            case "report": {
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
              boardcastToUser(vmWs.vmId, {
                type: "liveMetrics",
                data: {
                  vmId: vmWs.vmId,
                  metrics,
                },
              });
              break;
            }
            case "vm_info": {
              const data = message.data;
              console.log(data);
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
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            }),
          );
        }
      });
    } else if (pathname === "/wss/monitor/user") {
      const userWs = ws as UserWebSocket;
      userWs.on("message", async (data) => {
        const message = parseMsgPack(data) as MonitorUserClientEvent;
        switch (message.type) {
          case "startMonitor": {
            const vmIds =
              "vmIds" in message.data
                ? message.data.vmIds
                : "pageHandle" in message.data
                  ? ((
                      await db.query.page.findFirst({
                        where:
                          message.data.pageHandle === "default"
                            ? or(
                                and(
                                  eq(pageTable.handle, "default"),
                                  eq(pageTable.hostname, hostname),
                                ),
                                eq(pageTable.handle, "default"),
                              )
                            : eq(pageTable.handle, message.data.pageHandle),
                      })
                    )?.vmIds ?? [])
                  : [];
            for (const vmId of vmIds) {
              addVMListener(vmId, userWs);
            }
            userWs.send(
              pack({
                type: "monitoring",
                data: {
                  vmIds,
                },
              }),
            );
            break;
          }
          case "getMonitorMetrics": {
            const vmIds = message.data.vmIds;
            const metrics = await db
              .select()
              .from(metricsTable)
              .where(inArray(metricsTable.vmId, vmIds))
              .orderBy(desc(metricsTable.time));
            userWs.send(
              pack({
                type: "monitorMetrics",
                data: metrics,
              }),
            );
            break;
          }
        }
      });
      userWs.on("close", () => {
        removeVMListener(userWs);
      });
    }
  });
};
