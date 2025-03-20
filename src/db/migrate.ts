import { migrate } from "drizzle-orm/postgres-js/migrator";

import db from ".";

export async function runMigrate(exit = true) {
  console.log("⏳ Running migrations...");

  const start = Date.now();

  await migrate(db, { migrationsFolder: "drizzle" });

  const end = Date.now();

  console.log(`✅ Migrations completed in ${end - start}ms`);

  if (exit) {
    process.exit(0);
  }
}

if (import.meta.main) {
  runMigrate().catch((err) => {
    console.error("❌ Migration failed");
    console.error(err);
    process.exit(1);
  });
}
