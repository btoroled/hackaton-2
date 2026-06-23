# TropelCare Control Room

Consola operativa para **TropelCare (Pizza Protocol)**: dashboard, atlas de Tropeles con
paginación de servidor, feed infinito de Señales, atención de Señales y un motor de
scrollytelling por sector. Construida en **React + TypeScript** consumiendo una API
cerrada y determinística.

## Integrantes

| Nombre | Código | Responsable de |
|--------|--------|----------------|
| Miguel Rodriguez Arias | 202320226 | Checkpoint 1 (auth, dashboard, deploy) |
| Benjamin Toro Leddihn | 202510596 | Checkpoints 2 y 3 (Tropeles, feed) |
| Jobeth Alexander León Pantaleon| 202510035 | Checkpoint 4 (atender Señal) + Checkpoint 5 (Story) |


## Stack

- **React 18** + **TypeScript estricto**
- **Vite 7**
- **React Router 6**
- **Tailwind CSS 3**
- **Fetch API** (sin librerías de cache server-state ni infinite-scroll)

## Instalación y comandos

```bash
npm install        # instalar dependencias
npm run dev        # desarrollo en http://localhost:5173
npm run build      # typecheck (tsc -b) + build de producción
npm run typecheck  # solo verificación de tipos
npm run preview    # servir el build de producción localmente
```

## Variables de entorno

La app necesita **una sola variable**. Crea un archivo `.env` en la raíz:

```properties
VITE_API_BASE_URL=(https://hackaton-20261-front-587720740455.us-east1.run.app)
```

- En **local** es obligatoria, o el login fallará.
- En el **deploy** se configura en el panel de la plataforma (Vercel/Netlify).
- El TA entrega además `TEAM_CODE`, `EMAIL` y `PASSWORD`; estos **no van en `.env`**, se
  introducen en la pantalla de login.

## Deploy

**Link del deploy:** (https://hackaton-2-8f94.vercel.app/dashboard)

El repositorio incluye configuración de **SPA rewrite** (`vercel.json`, `netlify.toml` y
`public/_redirects`) para que **cualquier ruta** (`/dashboard`, `/signals`,
`/sectors/:id/story`, etc.) abra directo sin 404 al recargar en producción.

## Estructura

```
src/
  api/         cliente fetch tipado, endpoints y tipos del contrato
  auth/        AuthContext (login, restauración de sesión, logout) + ruta privada
  layouts/     AppLayout (navbar + logout)
  pages/       LoginPage, DashboardPage
  features/
    tropeles/  listado paginado, filtros/sort/URL, protección anti-stale
    signals/   feed cursor-based infinito + detalle y actualización de estado
    story/     scrollytelling por sector (scroll-driven + view transitions)
  router.tsx   rutas (públicas y protegidas)
```

## Decisiones técnicas por checkpoint

**CP1 — Consola.** `AuthContext` guarda el JWT en `localStorage` (`tropelcare.token`) y lo
adjunta como `Authorization: Bearer`. Al cargar, restaura la sesión con `/auth/me`;
`PrivateRoute` protege las rutas y redirige a `/login` conservando el destino.

**CP2 — Atlas de Tropeles.** Paginación real de servidor. Todo el estado (página, tamaño,
filtros, búsqueda, sort) vive en la **URL** (`useSearchParams`), por lo que se restaura al
recargar o compartir. Las respuestas obsoletas se descartan con un contador de
*generación*; cambiar cualquier filtro reinicia a `page=0`.

**CP3 — Feed infinito.** Scroll infinito **cursor-based** con `IntersectionObserver`,
**deduplicación por ID**, una sola carga en vuelo, cancelación de requests obsoletas
(`AbortController` + generación) y recuperación de error sin borrar páginas ya cargadas.
Filtros persistidos en URL.

**CP4 — Atender una Señal.** El detalle se abre como **panel sobre el feed** (el feed
permanece montado: conserva scroll y páginas) usando `?signal=<id>` en la URL. El `PATCH`
de estado deshabilita la acción mientras está en vuelo, muestra confirmación, y ante error
**conserva el estado anterior** ofreciendo reintento. Al actualizar, el cambio se refleja
en el feed sin recargar.

**CP5 — Sector Story Engine.** Scrollytelling con etapa activa por scroll
(`IntersectionObserver`), visual persistente *sticky* construido solo con CSS a partir de
`colorToken`/`assetKey`/`metrics`, **CSS Scroll-driven Animations** con fallback,
**View Transition API** con fallback, soporte de `prefers-reduced-motion` y navegación por
teclado. Sin video, GIF ni canvas pregrabado.

## Calidad

- `npm run typecheck` y `npm run build` terminan sin errores.
- Sin `any` en las respuestas de la API (todo tipado en `src/api/types.ts`).
