import type { WebSocket } from "ws";
import { unpack } from "msgpackr";

export const parseMsgPack = (data: WebSocket.RawData): unknown => {
  let binaryData: Uint8Array;

  if (data instanceof Buffer) {
    binaryData = data;
  } else if (Array.isArray(data)) {
    binaryData = Buffer.concat(data);
  } else if (data instanceof ArrayBuffer) {
    binaryData = new Uint8Array(data);
  } else {
    throw new Error("Unsupported data type received");
  }

  return unpack(binaryData);
};
