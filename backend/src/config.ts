import "dotenv/config";

function integer(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

function secret(name: string, fallback: string): string {
  const value = process.env[name] ?? fallback;
  if (process.env.NODE_ENV === "production" && value.length < 32) {
    throw new Error(`${name} must contain at least 32 characters in production`);
  }
  return value;
}

export const config = {
  port: integer("PORT", 8080),
  host: process.env.HOST ?? "0.0.0.0",
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: process.env.DATABASE_URL,
  // Cloud SQL (Cloud Run): conexion por unix socket en /cloudsql/<INSTANCE_CONNECTION_NAME>.
  // Se puede pasar la ruta completa con INSTANCE_UNIX_SOCKET o solo el nombre con
  // INSTANCE_CONNECTION_NAME (formato PROYECTO:REGION:INSTANCIA).
  instanceUnixSocket:
    process.env.INSTANCE_UNIX_SOCKET ??
    (process.env.INSTANCE_CONNECTION_NAME ? `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}` : undefined),
  dbHost: process.env.DB_HOST ?? "localhost",
  dbPort: integer("DB_PORT", 5432),
  dbName: process.env.DB_NAME ?? "tropelcare",
  dbUser: process.env.DB_USER ?? "tropelcare",
  dbPassword: process.env.DB_PASSWORD ?? "tropelcare",
  dbPoolMax: integer("DB_POOL_MAX", 10),
  jwtSecret: secret("JWT_SECRET", "development-jwt-secret-change-me"),
  adminToken: secret("ADMIN_TOKEN", "development-admin-secret-change-me"),
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  corsOriginPatterns: (process.env.CORS_ORIGIN_PATTERNS ?? "https://*.vercel.app,https://*.netlify.app")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  rateLimitPerWorkspace: integer("RATE_LIMIT_PER_WORKSPACE", 600),
  // En el arranque del server: migra siempre y, si la BD esta vacia, hace seed una
  // sola vez. Pon SEED_ON_BOOT=false para desactivarlo.
  seedOnBoot: process.env.SEED_ON_BOOT !== "false",
  seedPasswordPrefix: process.env.SEED_PASSWORD_PREFIX ?? "Pizza",
  seedWorkspaceCount: integer("SEED_WORKSPACE_COUNT", 100),
  seedTropelsPerWorkspace: integer("SEED_TROPELS_PER_WORKSPACE", 120),
  seedSignalsPerWorkspace: integer("SEED_SIGNALS_PER_WORKSPACE", 600),
} as const;

export type AppConfig = typeof config;
