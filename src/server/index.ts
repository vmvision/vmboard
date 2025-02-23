import { Hono } from "hono";
import { cors } from "hono/cors";

// import { handleError } from './error'
import merchantRouter from "./routes/merchant";
import vmRouter from "./routes/terminal";

const app = new Hono();

// app.onError(handleError);

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
  .route("/merchant", merchantRouter);

app.use(async (c, next) => {
  await next();
  console.log(`${c.res.status} [${c.req.method}] ${c.req.url}`);
});

export default app;

export type AppType = typeof routes;
