import { env } from "./env";
import http from "node:http";

import next from "next";
import packageJson from "../package.json";

const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

/**
 * Pro
 */
void app.prepare().then(async () => {
  try {
    const server = http.createServer((req, res) => {
      handle(req, res);
    });

    (await import("./server/monitor")).setupMonitorWebSocketServer(server);
    (await import("./server/terminal")).setupTerminalWebSocketServer(server);

    server.on("listening", () => {
      console.log(
        `[VMBoard] v${packageJson.version} running on http://localhost:${PORT}`,
      );
    });

    server.listen(PORT);

    // if (env.ENABLE_ALERT_QUEUE) {
    //   if (!env.REDIS_URL) {
    //     throw new Error("REDIS_URL is not set which is required for alert queue");
    //   }
    //   await (await import("./queues")).default();
    // }
  } catch (e) {
    console.error("[VMBoard] failed to start with error:", e);
  }
});
