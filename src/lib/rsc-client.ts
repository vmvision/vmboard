import "server-only";
import { hcWithType } from "@/server/hc";
import { headers } from "next/headers";
import { env } from "@/env";

const rscClient = hcWithType(new URL("/api", env.BASE_URL).toString(), {
  init: {
    credentials: "include",
  },
  headers: async () => {
    const h = await headers();
    return {
      Cookie: h.get("cookie") ?? "",
    };
  },
});

export default rscClient;
