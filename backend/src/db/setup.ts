import type pg from "pg";
import { pathToFileURL } from "node:url";
import { migrate } from "./migrate.js";
import { createPool } from "./pool.js";
import { seedAll } from "./seed.js";

// Clave para el advisory lock de Postgres: evita que dos instancias de Cloud Run
// hagan seed al mismo tiempo en el primer deploy.
const BOOTSTRAP_LOCK_KEY = 4815162342;

export async function setupDatabase(): Promise<void> {
  const databasePool = createPool();
  try {
    await migrate(databasePool);
    await seedAll(databasePool);
  } finally {
    await databasePool.end();
  }
}

/**
 * Hace seed una sola vez, solo si la BD no tiene workspaces. Usa un advisory lock
 * para que con varias instancias solo una corra el seed. Idempotente y seguro de
 * llamar en cada arranque del server.
 */
export async function ensureSeeded(databasePool: pg.Pool): Promise<boolean> {
  const client = await databasePool.connect();
  try {
    const lock = await client.query<{ locked: boolean }>(
      "SELECT pg_try_advisory_lock($1) AS locked",
      [BOOTSTRAP_LOCK_KEY],
    );
    if (!lock.rows[0]?.locked) return false; // otra instancia ya esta sembrando
    try {
      const count = await client.query<{ n: number }>(
        "SELECT COUNT(*)::int AS n FROM workspaces",
      );
      if ((count.rows[0]?.n ?? 0) > 0) return false; // ya hay datos, no re-sembramos
      await seedAll(databasePool);
      return true;
    } finally {
      await client.query("SELECT pg_advisory_unlock($1)", [BOOTSTRAP_LOCK_KEY]);
    }
  } finally {
    client.release();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await setupDatabase();
  console.log("Database migration and seed completed");
}
