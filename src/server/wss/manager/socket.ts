import { WebSocket } from "ws";
import type { SocketIdentifier } from "../types";

declare global {
  var socketMap: Map<SocketIdentifier, WebSocket> | undefined;
}

class SocketManager {
  private static instance: SocketManager;
  private socketMap: Map<SocketIdentifier, WebSocket> = new Map();

  private constructor() {
    if (!global.socketMap) {
      global.socketMap = new Map<SocketIdentifier, WebSocket>();
    }
    this.socketMap = global.socketMap;
  }

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  addSocket(id: SocketIdentifier, socket: WebSocket) {
    this.socketMap.set(id, socket);
    return id;
  }

  removeSocket(id: SocketIdentifier) {
    this.socketMap.delete(id);
  }

  getSocket<T extends WebSocket>(id: SocketIdentifier) {
    return this.socketMap.get(id) as T | undefined;
  }

  sendMessage(id: SocketIdentifier, message: unknown) {
    const socket = this.getSocket(id);
    if (
      !socket ||
      socket.readyState === WebSocket.CLOSED ||
      socket.readyState === WebSocket.CLOSING
    ) {
      return false;
    }
    if (socket.readyState === WebSocket.CONNECTING) {
      socket.once("open", () => {
        socket.send(message as Buffer);
      });
      return true;
    }
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message as Buffer);
      return true;
    }
    return false;
  }
}

export const socketManager = SocketManager.getInstance();
