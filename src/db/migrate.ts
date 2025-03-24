import { migrate } from "drizzle-orm/postgres-js/migrator";

import db from ".";

export async function runMigrate() {
  console.log("⏳ Running migrations...");

  const start = Date.now();

  await migrate(db, { migrationsFolder: "drizzle" });

  const end = Date.now();

  console.log(`✅ Migrations completed in ${end - start}ms`);
}

if (process.env.RUN_MIGRATE === "1") {
  runMigrate()
    .then(() => {
      console.log("✅ Migration completed, exiting...");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Migration failed");
      console.error(err);
      process.exit(1);
    });
}
