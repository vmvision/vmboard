import { hcWithType } from "@/server/hc";
import type { InferRequestType, InferResponseType } from "hono/client";

const apiClient = hcWithType("/api", {
  init: {
    credentials: "include",
  },
});

export function fetchWrapper<F extends Function>(fn: F) {
  return async ([_, arg]: [string, InferRequestType<F>]): Promise<
    InferResponseType<F>
  > => {
    const res = await fn(arg);
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return (await res.json()) as InferResponseType<F>;
  };
}

export default apiClient;
