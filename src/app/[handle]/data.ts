import { env } from "@/env";
import { headers } from "next/headers";

export const getHostname = async () => {
  const host = (await headers()).get("host");
  if (!host) {
    return null;
  }
  const hostname = new URL(`http://${host}`).hostname;
  if (hostname === env.HOSTNAME) {
    return null;
  }
  return hostname;
};
