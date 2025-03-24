import { WebSocket } from "ws";
import type { SocketIdentifier, VMIdentifier } from "../types";
import { socketManager } from "./socket";
import { pack } from "msgpackr";

declare global {
  /* vmId <- SocketId */
  var vmMap: Map<VMIdentifier, SocketIdentifier> | undefined;
}

class VmManager {
  private static instance: VmManager;
  private vmMap = new Map<VMIdentifier, SocketIdentifier>();

  private constructor() {
    if (!global.vmMap) {
      global.vmMap = new Map<VMIdentifier, SocketIdentifier>();
    }
    this.vmMap = global.vmMap;
  }

  static getInstance(): VmManager {
    if (!VmManager.instance) {
      VmManager.instance = new VmManager();
    }
    return VmManager.instance;
  }

  /**
   * Check if the socket is open for the given VM ID
   * @param vmId - The ID of the VM to check
   * @returns true if the socket is open, false otherwise
   */
  checkSocket(vmId: VMIdentifier) {
    const socketId = this.vmMap.get(vmId);
    if (!socketId) {
      return false;
    }
    const socket = socketManager.getSocket(socketId);
    if (!socket) {
      this.removeSocket(vmId);
      return false;
    }
    return socket.readyState === WebSocket.OPEN;
  }

  addSocket(vmId: VMIdentifier, socketId: SocketIdentifier) {
    this.vmMap.set(vmId, socketId);
  }

  removeSocket(vmId: VMIdentifier) {
    this.vmMap.delete(vmId);
  }

  broadcast(vmId: VMIdentifier, message: unknown) {
    const socketId = this.vmMap.get(vmId);
    if (!socketId) {
      return;
    }
    socketManager.sendMessage(socketId, pack(message));
  }
}

export const vmManager = VmManager.getInstance();
