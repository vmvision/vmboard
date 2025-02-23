"use client";

import { FitAddon } from "@xterm/addon-fit";
import { Terminal as XTermTerminal } from "@xterm/xterm";
import React, { useEffect, useRef } from "react";
import "@xterm/xterm/css/xterm.css";
import { cn } from "@/lib/utils";
import { AttachAddon } from "@xterm/addon-attach";
import { WebglAddon } from "@xterm/addon-webgl";

interface TerminalProps {
  vmId: string;
  className?: string;
}

const Terminal: React.FC<TerminalProps> = ({ className, vmId }) => {
  const termRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTermTerminal | null>(null);
  const [activeWay, setActiveWay] = React.useState<string | undefined>("bash");

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.dispose();
    }

    if (!termRef.current) return;

    const term = new XTermTerminal({
      cursorBlink: true,
      cols: 80,
      rows: 30,
      lineHeight: 1.4,
      convertEol: true,
      theme: {
        cursor: "transparent",
        background: "rgba(0, 0, 0, 0)",
      },
    });
    terminalRef.current = term;
    const addonFit = new FitAddon();

    // biome-ignore lint/style/noNonNullAssertion: exist
    term.open(termRef.current!);
    term.loadAddon(addonFit);

    const { cols, rows } = term;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/wss/terminal?vmId=${vmId}&activeWay=${activeWay}&cols=${cols}&rows=${rows}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      const addonAttach = new AttachAddon(ws);
      term.loadAddon(addonAttach);

      // 尝试加载 WebGL 插件以提高性能
      try {
        const webgl = new WebglAddon();
        term.loadAddon(webgl);
      } catch (e) {
        console.warn("WebGL addon could not be loaded", e);
      }
    };

    // observe and handle window size change
    const handleResize = () => {
      addonFit.fit();
      const { cols, rows } = term;
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "resize",
            cols,
            rows,
          }),
        );
      }
    };
    window.addEventListener("resize", handleResize);
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(termRef.current);

    return () => {
      // window.removeEventListener("resize", handleResize);
      // resizeObserver.disconnect();
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      // term.dispose();
    };
  }, [vmId, activeWay]);

  return (
    <div
      className={cn(
        "h-full w-full flex-1 rounded-lg bg-[#19191A] p-2",
        className,
      )}
    >
      <div ref={termRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};
export default Terminal;
