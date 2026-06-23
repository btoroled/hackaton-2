import type { FastifyInstance } from "fastify";
import type pg from "pg";
import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPI } from "openapi-types";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { config } from "../src/config.js";
import { migrate } from "../src/db/migrate.js";
import { createPool } from "../src/db/pool.js";
import { seedWorkspace } from "../src/db/seed.js";

const testConfig = {
  ...config,
  seedWorkspaceCount: 2,
  seedTropelsPerWorkspace: 24,
  seedSignalsPerWorkspace: 60,
  seedPasswordPrefix: "Pizza",
  adminToken: "test-admin-token",
};

let pool: pg.Pool;
let app: FastifyInstance;

async function seedTeams(): Promise<void> {
  const client = await pool.connect();
  try {
    for (const teamNumber of [1, 2]) {
      await client.query("BEGIN");
      await seedWorkspace(client, teamNumber, {
        tropelsPerWorkspace: testConfig.seedTropelsPerWorkspace,
        signalsPerWorkspace: testConfig.seedSignalsPerWorkspace,
        passwordPrefix: testConfig.seedPasswordPrefix,
      });
      await client.query("COMMIT");
    }
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function login(team = 1): Promise<string> {
  const code = team.toString().padStart(3, "0");
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    payload: {
      teamCode: `TEAM-${code}`,
      email: "operator@tuckersoft.com",
      password: `Pizza-TEAM-${code}`,
    },
  });
  expect(response.statusCode).toBe(200);
  return response.json<{ token: string }>().token;
}

beforeAll(async () => {
  pool = createPool();
  await migrate(pool);
  await seedTeams();
  app = await buildApp({ pool, config: testConfig, logger: false });
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await pool.end();
});

describe("public contract", () => {
  it("publishes Swagger with every student endpoint and no admin routes", async () => {
    const response = await app.inject({ method: "GET", url: "/api/v1/openapi.json" });
    expect(response.statusCode).toBe(200);
    const document = response.json<OpenAPI.Document>();
    await expect(SwaggerParser.validate(document)).resolves.toBeTruthy();
    const paths = Object.keys(document.paths ?? {});
    expect(paths).toEqual(
      expect.arrayContaining([
        "/auth/login",
        "/auth/me",
        "/dashboard/summary",
        "/tropels",
        "/tropels/{id}",
        "/signals/feed",
        "/signals/{id}",
        "/signals/{id}/status",
        "/sectors",
        "/sectors/{id}/story",
      ]),
    );
    expect(paths.some((path) => path.includes("/admin/"))).toBe(false);
  });

  it("authenticates and restores the session", async () => {
    const token = await login();
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ teamCode: "TEAM-001", role: "OPERATOR" });
  });

  it("returns actionable validation errors", async () => {
    const token = await login();
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/tropels?page=-1&size=11",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ error: "VALIDATION_ERROR", path: "/api/v1/tropels" });
  });
});

describe("workspace isolation and lists", () => {
  it("paginates and combines filters for Tropeles", async () => {
    const token = await login();
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/tropels?page=0&size=10&sort=chaosIndex%2Cdesc",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json<{ content: Array<{ chaosIndex: number }>; totalElements: number; size: number }>();
    expect(body.content).toHaveLength(10);
    expect(body.totalElements).toBe(24);
    expect(body.size).toBe(10);
    expect(body.content[0]!.chaosIndex).toBeGreaterThanOrEqual(body.content[1]!.chaosIndex);
  });

  it("uses an opaque cursor without duplicate signal IDs", async () => {
    const token = await login();
    const first = await app.inject({
      method: "GET",
      url: "/api/v1/signals/feed?limit=10",
      headers: { authorization: `Bearer ${token}` },
    });
    const firstBody = first.json<{ items: Array<{ id: string }>; nextCursor: string; hasMore: boolean }>();
    expect(first.statusCode).toBe(200);
    expect(firstBody.hasMore).toBe(true);
    const second = await app.inject({
      method: "GET",
      url: `/api/v1/signals/feed?limit=10&cursor=${encodeURIComponent(firstBody.nextCursor)}`,
      headers: { authorization: `Bearer ${token}` },
    });
    const secondBody = second.json<{ items: Array<{ id: string }> }>();
    expect(second.statusCode).toBe(200);
    const ids = [...firstBody.items, ...secondBody.items].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);

    const wrongFilters = await app.inject({
      method: "GET",
      url: `/api/v1/signals/feed?limit=10&severity=CRITICO&cursor=${encodeURIComponent(firstBody.nextCursor)}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(wrongFilters.statusCode).toBe(400);
  });

  it("hides resources belonging to another workspace", async () => {
    const token = await login(2);
    const [tropel, signal, story] = await Promise.all([
      app.inject({
        method: "GET",
        url: "/api/v1/tropels/trp_001_001",
        headers: { authorization: `Bearer ${token}` },
      }),
      app.inject({
        method: "GET",
        url: "/api/v1/signals/sig_001_0001",
        headers: { authorization: `Bearer ${token}` },
      }),
      app.inject({
        method: "GET",
        url: "/api/v1/sectors/sec_001_01/story",
        headers: { authorization: `Bearer ${token}` },
      }),
    ]);
    expect([tropel.statusCode, signal.statusCode, story.statusCode]).toEqual([404, 404, 404]);
  });
});

describe("signals, story and TA controls", () => {
  it("updates a signal with a simple PATCH and rejects RECIBIDA", async () => {
    const token = await login();
    const response = await app.inject({
      method: "PATCH",
      url: "/api/v1/signals/sig_001_0001/status",
      headers: { authorization: `Bearer ${token}` },
      payload: { status: "ATENDIDA" },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ id: "sig_001_0001", status: "ATENDIDA" });

    const invalid = await app.inject({
      method: "PATCH",
      url: "/api/v1/signals/sig_001_0001/status",
      headers: { authorization: `Bearer ${token}` },
      payload: { status: "RECIBIDA" },
    });
    expect(invalid.statusCode).toBe(400);
  });

  it("returns exactly eight ordered story stages", async () => {
    const token = await login();
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/sectors/sec_001_01/story",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json<{ stages: Array<{ order: number; progress: number }> }>();
    expect(body.stages).toHaveLength(8);
    expect(body.stages.map((stage) => stage.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(body.stages[0]!.progress).toBe(0);
    expect(body.stages[7]!.progress).toBe(1);
  });

  it("applies a private controlled failure once", async () => {
    const token = await login();
    const configured = await app.inject({
      method: "POST",
      url: "/api/v1/admin/workspaces/TEAM-001/scenario",
      headers: { "x-admin-token": testConfig.adminToken },
      payload: { nextReadError: true },
    });
    expect(configured.statusCode).toBe(200);

    const first = await app.inject({
      method: "GET",
      url: "/api/v1/sectors",
      headers: { authorization: `Bearer ${token}` },
    });
    const second = await app.inject({
      method: "GET",
      url: "/api/v1/sectors",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(first.statusCode).toBe(500);
    expect(first.json()).toMatchObject({ error: "CONTROLLED_ERROR" });
    expect(second.statusCode).toBe(200);
  });
});
