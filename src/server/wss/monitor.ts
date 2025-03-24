import type http from "node:http";
import { desc, eq, inArray } from "drizzle-orm";
import { WebSocketServer } from "ws";
import db from "@/db";
import { metrics as metricsTable } from "@/db/schema/metrics";
import { auth } from "@/lib/auth";
import { pack } from "msgpackr";
import type { MonitorUserClientEvent, MonitorWebSocket } from "./types";
import { parseMsgPack } from "./utils";
import { page as pageTable } from "@/db/schema/page";
import { socketManager } from "./manager/socket";
import { v4 as uuid } from "uuid";
import { monitorManager } from "./manager/monitor-manager";

const WSS_PATHNAME = "/wss/monitor";
export const setupMonitorWebSocketServer = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
) => {
  const wssTerm = new WebSocketServer({
    noServer: true,
  });
  /* Connection and Authentication */
  server.on("upgrade", async (req, socket, head) => {
    const { pathname } = new URL(
      req.url ?? "/",
      `http://${req.headers.host ?? "localhost"}`,
    );
    if (pathname !== WSS_PATHNAME) return;
    socket.on("error", (err) => {
      console.error(err);
    });
    const unauthenticated = (message?: string): void => {
      socket.write(`HTTP/1.1 401 Unauthorized\r\n\r\n${message ?? ""}`);
      socket.destroy();
      return;
    };
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as Record<string, string>),
    });
    if (!session) return unauthenticated("No session");
    wssTerm.handleUpgrade(req, socket, head, function done(ws) {
      const monitorWs = ws as MonitorWebSocket;
      monitorWs.id = uuid();
      monitorWs.session = session;
      monitorWs.listenVmIds = [];
      socketManager.addSocket(monitorWs.id, monitorWs);
      wssTerm.emit("connection", monitorWs, req);
    });
  });
  wssTerm.on("connection", async (userWs: MonitorWebSocket, req) => {
    userWs.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
    userWs.on("message", async (data) => {
      const message = parseMsgPack(data) as MonitorUserClientEvent;
      switch (message.type) {
        case "startMonitor": {
          const vmIds =
            "vmIds" in message.data
              ? message.data.vmIds
              : "pageId" in message.data
                ? ((
                    await db.query.page.findFirst({
                      where: eq(pageTable.id, message.data.pageId),
                      with: {
                        pageVMs: {
                          with: {
                            vm: true,
                          },
                        },
                      },
                    })
                  )?.pageVMs?.map((pageVM) => pageVM.vm.id) ?? [])
                : [];
          monitorManager.listen(userWs.id, vmIds);
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
      socketManager.removeSocket(userWs.id);
      monitorManager.unlisten(userWs.id, "all");
    });
  });
};
