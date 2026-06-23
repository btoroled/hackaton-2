# TropelCare Backend

API cerrada de la hackathon Pizza Protocol. El contrato publico se genera desde los
schemas TypeBox y se presenta con Swagger UI.

## Requisitos

- Node.js 20+
- Docker con Compose

## Inicio local

```bash
cp .env.example .env
docker compose up -d postgres
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

URLs:

- Swagger UI: http://localhost:8080/docs
- OpenAPI JSON: http://localhost:8080/api/v1/openapi.json
- Readiness: http://localhost:8080/api/v1/ready

Credenciales generadas:

```txt
TEAM_CODE=TEAM-001
EMAIL=operator@tuckersoft.com
PASSWORD=Pizza-TEAM-001
```

El password sigue el formato `<SEED_PASSWORD_PREFIX>-<TEAM_CODE>`. Cada equipo tambien
tiene `operator2@tuckersoft.com` y `operator3@tuckersoft.com` con el mismo password de
su workspace.

## Validacion

Con PostgreSQL levantado:

```bash
npm run typecheck
npm run build
npm test
```

Las pruebas usan PostgreSQL real y cubren Swagger, autenticacion, validacion, paginacion,
cursor, aislamiento multi-tenant, PATCH, story y fallos docentes controlados.

## Rutas docentes privadas

No aparecen en Swagger. Requieren `X-Admin-Token`:

```txt
POST /api/v1/admin/workspaces/:teamCode/reset
POST /api/v1/admin/workspaces/:teamCode/scenario
```

Ejemplo de fallo para la siguiente lectura:

```bash
curl -X POST http://localhost:8080/api/v1/admin/workspaces/TEAM-001/scenario \
  -H 'Content-Type: application/json' \
  -H 'X-Admin-Token: development-admin-secret-change-me' \
  -d '{"nextReadError":true}'
```

Estas rutas son para el TA y no deben compartirse con los participantes.
