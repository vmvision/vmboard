import { Hono } from "hono";
import { cors } from "hono/cors";

import merchantRouter from "./routes/merchant";
import vmRouter from "./routes/vm";
import pageRouter from "./routes/page";
import { errorHandler } from "./error";

const app = new Hono();

// Error Handler
app.onError(errorHandler);

// CORS
app.use(
  "*",
  cors({
    origin: ["*"],
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
  }),
);

// Business Routes
export const routes = app
  .route("/vm", vmRouter)
  .route("/merchant", merchantRouter)
  .route("/page", pageRouter);

app.use(async (c, next) => {
  await next();
  console.log(`${c.res.status} [${c.req.method}] ${c.req.url}`);
});

export default app;

export type AppType = typeof routes;
