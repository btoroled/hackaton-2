# TropelCare Control Room

Consola operativa en React + TypeScript para la hackathon TropelCare (Pizza Protocol).

## Integrantes

- Jobeth Alexander — `<TU-CODIGO>` — Checkpoint 5: Sector Story Engine
- _(integrante B)_ — `<codigo>`
- _(integrante C)_ — `<codigo>`

## Stack

- React 18 + TypeScript estricto
- Vite
- React Router
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Fetch API (sin librerías de cache/infinite-scroll)

## Instalación y comandos

```bash
npm install
npm run dev        # entorno de desarrollo (http://localhost:5173)
npm run build      # typecheck (tsc -b) + build de producción
npm run typecheck  # solo verificación de tipos
npm run preview    # sirve el build de producción
```

## Variables de entorno

Copia `.env.example` a `.env` y completa con lo que entregue el TA:

```properties
VITE_API_BASE_URL=https://<backend-url>/api/v1
```

> Si `VITE_API_BASE_URL` no apunta a un backend real, la app entra en **modo demo**
> con datos mock deterministicos (útil para desarrollar el visual sin credenciales).
> El login del equipo guarda el JWT en `localStorage` bajo la clave `tropelcare.token`,
> que la capa API adjunta como `Authorization: Bearer <token>`.

## Deploy

`<link del deploy>`

SPA con rewrite a `index.html` para que cualquier ruta (`/sectors/:id/story`, etc.)
abra directo sin 404.

## Checkpoint 5 — Sector Story Engine (decisiones técnicas)

Experiencia de scrollytelling en `/sectors/:id/story` construida solo con la data de
`GET /sectors/:id/story` (8 etapas). Sin video, GIF ni canvas pregrabado.

- **Etapa activa por scroll:** `IntersectionObserver` (`useActiveStage`) detecta la
  sección central de la pantalla. Sirve además como fallback robusto.
- **Visual persistente:** panel `sticky` (`StoryVisual`) construido 100% con CSS a
  partir de `colorToken`, `assetKey`, `climate` y las `metrics` de la etapa activa.
- **CSS Scroll-driven Animations:** la barra de recorrido usa `animation-timeline:
  scroll()` cuando hay soporte (`@supports`); fallback con ancho controlado por JS
  (`--progress`) cuando no.
- **View Transition API:** transición entre _resumen_ e _historia_ con
  `document.startViewTransition` cuando existe soporte; fallback que aplica el cambio
  de estado directamente (`viewTransition.ts`).
- **`prefers-reduced-motion`:** respetado globalmente (CSS) y en el helper de View
  Transitions.
- **Teclado:** flechas / PageUp-Down / Home / End navegan entre etapas; cada sección
  es enfocable y los pasos del progreso son botones.
- **Desktop/mobile:** layout de 2 columnas en desktop, apilado en mobile; comportamiento
  equivalente.
- **Tipado estricto:** todas las respuestas tipadas en `src/types.ts`, sin `any`.
