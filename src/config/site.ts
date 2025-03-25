import { env } from "@/env";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "VMBoard",
  description:
    "VMBoard is management aggregation panel for major VPS Hosting providers.",
  url:
    env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://vmboard.app",
  links: {
    github: "https://github.com/AprilNEA/vmboard",
    docs: "https://vmboard.io",
  },
};
