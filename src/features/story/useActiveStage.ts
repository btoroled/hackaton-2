import { useEffect, useRef, useState } from "react";

interface UseActiveStage {
  active: number;
  setActive: (index: number) => void;
  setRef: (index: number) => (el: HTMLElement | null) => void;
  scrollTo: (index: number) => void;
}

export function useActiveStage(count: number): UseActiveStage {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLElement | null>>([]);

  if (refs.current.length !== count) {
    refs.current = Array.from(
      { length: count },
      (_, i) => refs.current[i] ?? null,
    );
  }

  useEffect(() => {
    const sections = refs.current.filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const indexOf = new Map<Element, number>();
    sections.forEach((el, i) => indexOf.set(el, i));

    // Secciones que cruzan la linea central del viewport.
    const intersecting = new Set<number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = indexOf.get(entry.target);
          if (i === undefined) continue;
          if (entry.isIntersecting) intersecting.add(i);
          else intersecting.delete(i);
        }
        // La etapa activa es la seccion que pasa por el centro. Si hay varias
        // (transicion entre secciones), tomamos la mas avanzada.
        if (intersecting.size > 0) {
          setActive(Math.max(...intersecting));
        }
      },
      {
        // Root colapsado a una linea horizontal en el centro de la pantalla:
        // exactamente la seccion que cruza el centro queda "intersecting".
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0,
      },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [count]);

  const setRef = (index: number) => (el: HTMLElement | null) => {
    refs.current[index] = el;
  };

  const scrollTo = (index: number) => {
    const el = refs.current[index];
    if (!el) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      block: "center",
      behavior: prefersReduced ? "auto" : "smooth",
    });
  };

  return { active, setActive, setRef, scrollTo };
}
