import api from "@/server/index";
import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono();
app.route("/api", api);
const handler = handle(app);

export {
  handler as DELETE,
  handler as GET,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
