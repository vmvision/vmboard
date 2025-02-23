import { env } from "@/env.js";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from 'pg';

import * as schema from "./schema";

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
});
export const db = drizzle(pool, { schema });
