import { pack } from "msgpackr";
import { socketManager } from "./socket";
import type {
  VMIdentifier,
  SocketIdentifier,
  MonitorWebSocket,
} from "../types";

declare global {
  /* vmId <- socketId[] */
  var monitorMap: Map<VMIdentifier, SocketIdentifier[]> | undefined;
}

class MonitorManager {
  private static instance: MonitorManager;
  private monitorMap = new Map<VMIdentifier, SocketIdentifier[]>();

  private constructor() {
    if (!global.monitorMap) {
      global.monitorMap = new Map<VMIdentifier, SocketIdentifier[]>();
    }
    this.monitorMap = global.monitorMap;
  }

  static getInstance(): MonitorManager {
    if (!MonitorManager.instance) {
      MonitorManager.instance = new MonitorManager();
    }
    return MonitorManager.instance;
  }

  listen(socketId: SocketIdentifier, vmIds: VMIdentifier[]) {
    const socket = socketManager.getSocket<MonitorWebSocket>(socketId);
    if (!socket) {
      return;
    }
    for (const vmId of vmIds) {
      this.monitorMap.set(
        vmId,
        (this.monitorMap.get(vmId) ?? []).concat(socketId),
      );
    }
    socket.listenVmIds = socket.listenVmIds.concat(vmIds);
  }

  unlisten(socketId: SocketIdentifier, vmIds: "all" | VMIdentifier[]) {
    const socket = socketManager.getSocket<MonitorWebSocket>(socketId);
    if (vmIds === "all") {
      this.monitorMap.forEach((_, vmId) => {
        this.monitorMap.set(
          vmId,
          (this.monitorMap.get(vmId) ?? []).filter((id) => id !== socketId),
        );
      });
      if (socket) {
        socket.listenVmIds = [];
      }
      return;
    }
    for (const vmId of vmIds) {
      this.monitorMap.set(
        vmId,
        (this.monitorMap.get(vmId) ?? []).filter((id) => id !== socketId),
      );
    }
    if (socket) {
      socket.listenVmIds = socket.listenVmIds.filter((id) => !vmIds.includes(id));
    }
  }

  broadcast(vmId: number, message: unknown) {
    const vmListeners = this.monitorMap.get(vmId) ?? [];
    for (const listener of vmListeners) {
      if (!socketManager.sendMessage(listener, pack(message))) {
        this.unlisten(listener, [vmId]);
      }
    }
  }
}

export const monitorManager = MonitorManager.getInstance();
