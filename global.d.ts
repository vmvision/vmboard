import type messages from "./messages/zh.json";

export type Messages = typeof messages;

declare module "next-intl" {
  interface AppConfig {
    Messages: Messages;
  }
}
