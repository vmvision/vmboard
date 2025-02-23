import "server-only";
import { hcWithType } from "@/server/hc";
import { headers } from "next/headers";

const rscClient = hcWithType("http://localhost:3000/api", {
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
