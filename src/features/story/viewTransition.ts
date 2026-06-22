/**
 * Ejecuta `update` dentro de una View Transition cuando el navegador la soporta.
 * Si no hay soporte (o el usuario prefiere movimiento reducido), ejecuta
 * `update` directamente (fallback funcional).
 */
export function withViewTransition(update: () => void): void {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if ("startViewTransition" in document && !prefersReduced) {
    document.startViewTransition(update);
  } else {
    update();
  }
}
