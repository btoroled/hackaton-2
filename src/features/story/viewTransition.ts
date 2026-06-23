export function withViewTransition(update: () => void): void {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if ("startViewTransition" in document && !prefersReduced) {
    document.startViewTransition(update);
  } else {
    update();
  }
}
