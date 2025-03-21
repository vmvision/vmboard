import { Hono } from "hono";
import { cors } from "hono/cors";
import { openAPISpecs } from "hono-openapi";
import { apiReference } from "@scalar/hono-api-reference";

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

// API Documentation
app.get(
  "/docs",
  apiReference({
    theme: "saturn",
    spec: { url: "/api/openapi" },
  }),
);

app.get(
  "/openapi",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "VMBoard API",
        version: "1.0.0",
      },
      servers: [
        { url: "http://localhost:3000/api", description: "Local Server" },
      ],
      // @ts-ignore
      // "x-tagGroups": [
      // 	{
      // 		name: "Asset",
      // 		tags: ["asset"],
      // 	},
      // ],
    },
  }),
);

app.use(async (c, next) => {
  await next();
  console.log(`${c.res.status} [${c.req.method}] ${c.req.url}`);
});

export default app;

export type AppType = typeof routes;
