import type http from "node:http";
import { vm as vmTable } from "@/db/schema/vm";
import { and, eq, or } from "drizzle-orm";
import { WebSocket, WebSocketServer } from "ws";
import db from "@/db";
import { monitor as monitorTable } from "@/db/schema/monitor";
import { auth, type Session } from "@/lib/auth";
import { pack } from "msgpackr";
import type { MonitorUserClientEvent } from "./types";
import { parseMsgPack } from "./utils";
import { page as pageTable } from "@/db/schema/page";

interface VMWebSocket extends WebSocket {
  vmId: number;
  token: string;
}

interface UserWebSocket extends WebSocket {
  session: Session | null;
}

const vmSocketMap = new Map<number, VMWebSocket>();
const vmListenerMap = new Map<number, UserWebSocket[]>();

// export const broadcastToAll = (message: unknown) => {
//   const messageStr = JSON.stringify(message);
//   for (const socket of vmSocketMap.values()) {
//     if (socket.readyState === WebSocket.OPEN) {
//       socket.send(messageStr);
//     }
//   }
// };

// export const broadcastToVms = (vmIds: number[], message: unknown) => {
//   const messageStr = JSON.stringify(message);
//   for (const vmId of vmIds) {
//     const socket = vmSocketMap.get(vmId);
//     if (socket?.readyState === WebSocket.OPEN) {
//       socket.send(messageStr);
//     }
//   }
// };

export const getSocketByVmId = (vmId: number): VMWebSocket | undefined => {
  return vmSocketMap.get(vmId);
};

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

export const getAllConnections = () => vmSocketMap;

const messageType = {
  report: "report",
} as const;

interface ReportMessage {
  uptime: number;
  system: SystemMessage;
  network: NetworkMessage;
  disk: DiskMessage;
}

interface SystemMessage {
  cpuUsage: number;
  memoryUsed: number;
  memoryTotal: number;
  processCount: number;
}

interface DiskMessage {
  spaceUsed: number;
  spaceTotal: number;
}

interface NetworkMessage {
  downloadTraffic: number;
  uploadTraffic: number;
  tcpCount: number;
  udpCount: number;
}

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
          const vmWs = ws as VMWebSocket;
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
      const vmWs = ws as VMWebSocket;
      // 将新连接添加到 Map 中
      vmSocketMap.set(vmWs.vmId, vmWs);
    }
    //  else if (pathname === "/wss/monitor/user") {

    // }

    if (pathname === "/wss/monitor") {
      const vmWs = ws as VMWebSocket;
      vmWs.on("close", () => {
        vmSocketMap.delete(vmWs.vmId);
      });
      vmWs.on("message", async (data) => {
        try {
          const message = parseMsgPack(data) as {
            type: string;
            data: unknown;
          };
          if (
            typeof message !== "object" ||
            message === null ||
            !message?.type
          ) {
            throw new Error("Invalid message");
          }
          switch (message.type) {
            case messageType.report: {
              const data = message.data as ReportMessage;
              const metrics = (
                await db
                  .insert(monitorTable)
                  .values({
                    vmId: vmWs.vmId,
                    uptime: data.uptime,
                    cpuUsage: data.system.cpuUsage,
                    processCount: data.system.processCount,
                    memoryUsed: data.system.memoryUsed,
                    memoryTotal: data.system.memoryTotal,
                    diskUsed: data.disk.spaceUsed,
                    diskTotal: data.disk.spaceTotal,
                    networkIn: data.network.uploadTraffic,
                    networkOut: data.network.downloadTraffic,
                    tcpConnections: data.network.tcpCount,
                    udpConnections: data.network.udpCount,
                  })
                  .returning()
              )?.[0];
              boardcastToUser(vmWs.vmId, {
                type: "metrics",
                data: {
                  vmId: vmWs.vmId,
                  metrics,
                },
              });
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
            if ("vmIds" in message.data) {
              for (const vmId of message.data.vmIds) {
                addVMListener(vmId, userWs);
              }
              userWs.send(
                pack({
                  type: "monitoring",
                  data: {
                    vmIds: message.data.vmIds,
                  },
                }),
              );
            } else if ("pageHandle" in message.data) {
              const page = await db.query.page.findFirst({
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
              });
              if (!page) {
                throw new Error("Page not found");
              }
              for (const vmId of page.vmIds) {
                addVMListener(vmId, userWs);
              }
              userWs.send(
                pack({
                  type: "monitoring",
                  data: {
                    vmIds: page.vmIds,
                  },
                }),
              );
            }
            break;
          }
        }
      });
      userWs.on("close", () => {
        removeVMListener(userWs);
      });
    }
  });

  return {
    getSocketByVmId,
    getAllConnections,
  };
};
