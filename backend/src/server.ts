import { pathToFileURL } from "node:url";
import { buildApp } from "./app.js";
import { config } from "./config.js";
import { migrate } from "./db/migrate.js";
import { pool } from "./db/pool.js";
import { ensureSeeded } from "./db/setup.js";

export async function start(): Promise<void> {
  // Migracion idempotente antes de servir: garantiza el esquema en cada deploy.
  await migrate(pool);
  const app = await buildApp({ pool, config, logger: true });
  const shutdown = async (signal: string) => {
    app.log.info({ signal }, "Shutting down");
    await app.close();
    await pool.end();
    process.exit(0);
  };
  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
  await app.listen({ port: config.port, host: config.host });

  // Seed en segundo plano (una sola vez si la BD esta vacia) para no bloquear el
  // arranque ni el startup probe de Cloud Run.
  if (config.seedOnBoot) {
    void ensureSeeded(pool)
      .then((seeded) => {
        if (seeded) app.log.info("Seed inicial completado");
      })
      .catch((error) => app.log.error({ error }, "Seed en arranque fallo"));
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await start();
}
