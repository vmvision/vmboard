import api from "@/server/index";
import { handle } from "hono/vercel";

const handler = handle(api)

export {
  handler as DELETE,
  handler as GET,
  handler as PATCH,
  handler as POST,
  handler as PUT,
}