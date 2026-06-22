# TropelCare Control Room — Issues

> Tablero de tareas para la hackathon (2 horas, 3 integrantes).
> Cada issue es independiente salvo las dependencias listadas en **Depende de**.
> Convención de labels: `cp1`–`cp5`, `frontend`, `infra`, `blocker`.

**Bloqueador global:** `#1 Login` es prerrequisito de casi todo. Sin un JWT válido, B y C no pueden probar contra la API real. Prioridad máxima en los primeros minutos.

---

## Checkpoint 1 — Encender la consola
**Responsable sugerido:** Integrante A · **Dificultad:** fácil

### #1 — Login con credenciales del equipo
- **Labels:** `cp1` `frontend` `blocker`
- **Depende de:** —
- **Descripción:** Formulario que envía `teamCode`, `email`, `password` a `POST /auth/login`. Guardar el `token` y `expiresAt` (localStorage). Manejar credenciales inválidas.
- **Criterios de aceptación:**
  - [ ] Login exitoso redirige a `/dashboard`.
  - [ ] Credenciales inválidas muestran error sin romper el layout.
  - [ ] El token se persiste y se adjunta como `Authorization: Bearer <token>`.

### #2 — Ruta privada + layout base
- **Labels:** `cp1` `frontend`
- **Depende de:** #1
- **Descripción:** `PrivateRoute` que protege `/dashboard` y demás rutas. Layout con navbar y botón de logout.
- **Criterios de aceptación:**
  - [ ] Abrir `/dashboard` sin sesión redirige a `/login`.
  - [ ] Logout limpia el token y vuelve a `/login`.

### #3 — Restauración de sesión
- **Labels:** `cp1` `frontend`
- **Depende de:** #1
- **Descripción:** Al cargar la app, si hay token, llamar a `GET /auth/me` para restaurar la sesión.
- **Criterios de aceptación:**
  - [ ] Recargar en una ruta privada mantiene la sesión.
  - [ ] Token expirado/ inválido fuerza logout.

### #4 — Dashboard con datos reales
- **Labels:** `cp1` `frontend`
- **Depende de:** #2, #3
- **Descripción:** Consumir `GET /dashboard/summary` y mostrar KPIs (totalTropels, criticalTropels, openSignals, sectorStabilityAvg, signalsBySeverity).
- **Criterios de aceptación:**
  - [ ] Estados de loading, error y vacío implementados.
  - [ ] Sin datos hardcodeados.

### #5 — Deploy inicial
- **Labels:** `cp1` `infra`
- **Depende de:** #2
- **Descripción:** Deploy temprano en Vercel/Netlify con `VITE_API_BASE_URL` y rewrite SPA para que cualquier ruta abra directo.
- **Criterios de aceptación:**
  - [ ] El deploy abre directamente en `/dashboard`, `/tropels`, etc. (no 404).

---

## Checkpoint 2 — Atlas de Tropeles
**Responsable sugerido:** Integrante B · **Dificultad:** media

### #6 — Listado paginado de Tropeles
- **Labels:** `cp2` `frontend`
- **Depende de:** #1
- **Descripción:** Consumir `GET /tropels` con `page` (inicia en 0) y `size` (10/20/50). Renderizar `content`, `totalPages`, `currentPage`.
- **Criterios de aceptación:**
  - [ ] Paginación real del servidor (no cliente).
  - [ ] Controles de página y tamaño funcionando.

### #7 — Filtros, búsqueda y ordenamiento
- **Labels:** `cp2` `frontend`
- **Depende de:** #6
- **Descripción:** Filtros combinables `species`, `vitalState`, `sectorId`, búsqueda `q` y `sort` (`name,asc` / `updatedAt,desc` / `chaosIndex,desc`).
- **Criterios de aceptación:**
  - [ ] Filtros combinables entre sí.
  - [ ] Cambiar filtro resetea a `page=0`.

### #8 — Estado sincronizado con la URL
- **Labels:** `cp2` `frontend`
- **Depende de:** #7
- **Descripción:** Reflejar todo el estado (página, filtros, sort, q) en la URL con `useSearchParams`. Restaurar al recargar o compartir.
- **Criterios de aceptación:**
  - [ ] Copiar la URL en otra pestaña reproduce el mismo estado.
  - [ ] Loading/error/sin resultados no mueven el layout.

### #9 — Protección contra respuestas obsoletas
- **Labels:** `cp2` `frontend`
- **Depende de:** #6, #7
- **Descripción:** Cancelar/descartar requests viejas (AbortController o token de versión) para que no pinten resultados tardíos.
- **Criterios de aceptación:**
  - [ ] Cambiar filtros y página rápido nunca muestra resultados de una request anterior.

---

## Checkpoint 3 — Feed infinito
**Responsable sugerido:** Integrante B · **Dificultad:** media

### #10 — Carga inicial del feed cursor-based
- **Labels:** `cp3` `frontend`
- **Depende de:** #1
- **Descripción:** `GET /signals/feed` con `limit` (default 15, máx 30). Usar `items`, `nextCursor`, `hasMore`.
- **Criterios de aceptación:**
  - [ ] Primera página renderiza correctamente.

### #11 — Infinite scroll
- **Labels:** `cp3` `frontend`
- **Depende de:** #10
- **Descripción:** Carga automática al llegar al final (Intersection Observer). Una sola carga adicional en vuelo. Fin de lista cuando `hasMore=false`.
- **Criterios de aceptación:**
  - [ ] No hay botón "Cargar más".
  - [ ] Network nunca muestra dos cargas simultáneas.

### #12 — Deduplicación + filtros en URL
- **Labels:** `cp3` `frontend`
- **Depende de:** #11
- **Descripción:** Dedup por ID al concatenar páginas. Filtros (`signalType`, `severity`, `status`, `q`) persistidos en URL; cambiar filtro reinicia el cursor.
- **Criterios de aceptación:**
  - [ ] No aparecen IDs repetidos.
  - [ ] Cambiar filtro con request en vuelo descarta la respuesta vieja.

### #13 — Recuperación de error
- **Labels:** `cp3` `frontend`
- **Depende de:** #11
- **Descripción:** Si falla una página posterior, mostrar reintento sin borrar las páginas ya cargadas.
- **Criterios de aceptación:**
  - [ ] Error en página N conserva páginas 0..N-1.
  - [ ] Botón de reintento recupera el feed.

---

## Checkpoint 4 — Atender una señal
**Responsable sugerido:** Integrante B · **Dificultad:** media

### #14 — Detalle de señal
- **Labels:** `cp4` `frontend`
- **Depende de:** #10
- **Descripción:** Abrir `GET /signals/:id` desde el feed sin perder la posición de scroll anterior.
- **Criterios de aceptación:**
  - [ ] Volver del detalle conserva la posición del feed.
  - [ ] Loading y error implementados.

### #15 — Actualizar estado (PATCH)
- **Labels:** `cp4` `frontend`
- **Depende de:** #14
- **Descripción:** `PATCH /signals/:id/status` con `PROCESANDO` o `ATENDIDA`. Deshabilitar la acción mientras está en vuelo.
- **Criterios de aceptación:**
  - [ ] Confirmación al completar.
  - [ ] Error accionable que conserva el estado anterior y permite reintentar.

### #16 — Reflejar resultado en el feed
- **Labels:** `cp4` `frontend`
- **Depende de:** #15
- **Descripción:** Al volver al feed, el ítem refleja el nuevo estado.
- **Criterios de aceptación:**
  - [ ] El estado actualizado se ve sin recargar la página.

---

## Checkpoint 5 — Sector Story Engine (reto hard)
**Responsable sugerido:** Integrante C · **Dificultad:** hard

### #17 — Fetch y tipado de la historia
- **Labels:** `cp5` `frontend`
- **Depende de:** #1
- **Descripción:** `GET /sectors/:id/story`. Tipar estrictamente las 8 etapas (`stageOrder`, `title`, `narrative`, `metrics`, `assetKey`, `colorToken`, `progress`). Sin `any`.
- **Criterios de aceptación:**
  - [ ] 8 etapas ordenadas por `stageOrder`.

### #18 — Estructura de scrollytelling
- **Labels:** `cp5` `frontend`
- **Depende de:** #17
- **Descripción:** Secciones disparadas por scroll que determinan la etapa activa (Intersection Observer). Indicador de progreso del recorrido.
- **Criterios de aceptación:**
  - [ ] La etapa activa cambia al hacer scroll.
  - [ ] No es una lista de cards con animación decorativa.

### #19 — Visual persistente
- **Labels:** `cp5` `frontend`
- **Depende de:** #18
- **Descripción:** Panel visual sticky construido con CSS/`colorToken`/`assetKey` que cambia con la etapa activa y muestra las métricas correspondientes.
- **Criterios de aceptación:**
  - [ ] Las métricas mostradas corresponden a la etapa activa.
  - [ ] Sin video, GIF ni canvas pregrabado.

### #20 — CSS Scroll-driven Animations
- **Labels:** `cp5` `frontend`
- **Depende de:** #18
- **Descripción:** Usar scroll-driven animations cuando exista soporte; fallback funcional con JS/IntersectionObserver cuando no.
- **Criterios de aceptación:**
  - [ ] Funciona con y sin soporte de la API.

### #21 — View Transition API
- **Labels:** `cp5` `frontend`
- **Depende de:** #19
- **Descripción:** Transición entre resumen e historia con View Transition API; fallback funcional sin soporte.
- **Criterios de aceptación:**
  - [ ] Transición suave donde hay soporte; navegación equivalente donde no.

### #22 — Accesibilidad: reduced motion + teclado
- **Labels:** `cp5` `frontend`
- **Depende de:** #20, #21
- **Descripción:** Respetar `prefers-reduced-motion`. Navegación completa por teclado sin perder contenido. Comportamiento equivalente desktop/mobile.
- **Criterios de aceptación:**
  - [ ] Con reduced motion no hay animaciones que mareen, pero el contenido sigue accesible.
  - [ ] Recorrido completo navegable por teclado.

---

## Integración final (últimos 20–25 min)
**Responsable sugerido:** todos

### #23 — Integración + typecheck
- **Labels:** `infra` `blocker`
- **Depende de:** todos los checkpoints
- **Descripción:** Mergear ramas, resolver conflictos. `npm run typecheck` y `npm run build` sin errores. Sin `any` en respuestas de API.
- **Criterios de aceptación:**
  - [ ] `npm run typecheck` pasa.
  - [ ] `npm run build` pasa.

### #24 — Deploy final
- **Labels:** `infra`
- **Depende de:** #23
- **Descripción:** Deploy de producción con CORS correcto y rewrite SPA.
- **Criterios de aceptación:**
  - [ ] Cualquier ruta abre directo en el deploy.

### #25 — README + validación TA
- **Labels:** `infra`
- **Depende de:** #24
- **Descripción:** README con integrantes y códigos, instalación y comandos, variables requeridas, link del deploy y decisiones técnicas. Ensayar las validaciones del TA de cada checkpoint.
- **Criterios de aceptación:**
  - [ ] README completo.
  - [ ] Las 5 validaciones del TA pasan en el deploy entregado.

---

## Resumen de dependencias

| Issue | Depende de |
|-------|-----------|
| #1 | — |
| #2 | #1 |
| #3 | #1 |
| #4 | #2, #3 |
| #5 | #2 |
| #6 | #1 |
| #7 | #6 |
| #8 | #7 |
| #9 | #6, #7 |
| #10 | #1 |
| #11 | #10 |
| #12 | #11 |
| #13 | #11 |
| #14 | #10 |
| #15 | #14 |
| #16 | #15 |
| #17 | #1 |
| #18 | #17 |
| #19 | #18 |
| #20 | #18 |
| #21 | #19 |
| #22 | #20, #21 |
| #23 | todos |
| #24 | #23 |
| #25 | #24 |
