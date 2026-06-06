import { env } from "./config/env.js";
import { migrateDatabase } from "./db/migrate.js";
import { seedPatients } from "./db/seed.js";
import { app } from "./app.js";

async function startServer() {
  await migrateDatabase();
  await seedPatients();

  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
