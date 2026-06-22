import { useEffect, useRef, useState } from "react";

/**
 * Determina la etapa activa segun cual seccion esta visible.
 * Usa IntersectionObserver: funciona como deteccion robusta y como
 * fallback cuando el navegador no soporta CSS scroll-driven animations.
 */
export function useActiveStage(count: number) {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLElement | null>>([]);

  // Asegura un slot por etapa.
  if (refs.current.length !== count) {
    refs.current = Array.from({ length: count }, (_, i) => refs.current[i] ?? null);
  }

  useEffect(() => {
    const sections = refs.current.filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const visibility = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target, entry.intersectionRatio);
        }
        // La etapa activa es la mas visible en pantalla.
        let bestIndex = 0;
        let bestRatio = -1;
        sections.forEach((el, i) => {
          const ratio = visibility.get(el) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIndex = i;
          }
        });
        setActive(bestIndex);
      },
      {
        // Centro de la pantalla como zona de activacion.
        rootMargin: "-45% 0px -45% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [count]);

  const setRef = (index: number) => (el: HTMLElement | null) => {
    refs.current[index] = el;
  };

  const scrollTo = (index: number) => {
    refs.current[index]?.scrollIntoView({ block: "center" });
  };

  return { active, setActive, setRef, scrollTo };
}
