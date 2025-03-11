import { pack } from "msgpackr";
import { WebSocket } from "ws";

export interface VMWebSocket extends WebSocket {
  vmId: number;
  token: string;
}
/**
 * Bind to global to avoid nextjs hot reload reset
 */
declare global {
  var vmSocketMap: Map<number, VMWebSocket> | undefined;
}

class SocketManager {
  private static instance: SocketManager;
  private vmSocketMap = new Map<number, VMWebSocket>();

  private constructor() {
    if (!global.vmSocketMap) {
      global.vmSocketMap = new Map<number, VMWebSocket>();
    }
    this.vmSocketMap = global.vmSocketMap;
  }

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  addSocket(vmId: number, socket: VMWebSocket) {
    this.vmSocketMap.set(vmId, socket);
    console.log(
      `Socket added for VM ${vmId}. Current map size: ${this.vmSocketMap.size}`,
    );
  }

  removeSocket(vmId: number) {
    this.vmSocketMap.delete(vmId);
  }

  broadcast(vmIds: number[], message: unknown) {
    console.log("Broadcasting to VMs:", vmIds);
    console.log("Current socket map size:", this.vmSocketMap.size);

    for (const vmId of vmIds) {
      const socket = this.vmSocketMap.get(vmId);
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(pack(message));
      }
    }
  }
}

export const socketManager = SocketManager.getInstance();
export const broadcastToVms = (vmIds: number[], message: unknown) =>
  socketManager.broadcast(vmIds, message);
export const addVmSocket = (vmId: number, socket: VMWebSocket) =>
  socketManager.addSocket(vmId, socket);
export const removeVmSocket = (vmId: number) =>
  socketManager.removeSocket(vmId);
