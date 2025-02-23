import { hcWithType } from "@/server/hc";

const apiClient = hcWithType("http://localhost:3000/api", {
  init: {
    credentials: "include",
  },
});

export default apiClient;
