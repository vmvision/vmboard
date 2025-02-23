import { createFactory } from "hono/factory";
import { authMiddleware } from "./middleware/auth";
import type { auth } from "@/lib/auth";
import db, { type DataBase } from "@/db";

export type Env = {
  Variables: {
    db: DataBase;
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
};

/**
 * Auth and DB middleware
 */
const appFactory = createFactory<Env>({
  initApp: (app) => {
    app.use(authMiddleware);
    app.use(async (c, next) => {
      c.set("db", db);
      await next();
    });
  },
});

export default appFactory;
