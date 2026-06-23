import { useEffect, useRef, useState } from "react";

interface UseActiveStage {
  active: number;
  progress: number;
  setActive: (index: number) => void;
  setRef: (index: number) => (el: HTMLElement | null) => void;
  scrollTo: (index: number) => void;
}

export function useActiveStage(count: number): UseActiveStage {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
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

  // Progreso continuo 0..1: fraccion del recorrido (top de la primera etapa ->
  // bottom de la ultima) que la linea central del viewport ha cruzado.
  // Alimenta la barra de progreso para que avance suave con el scroll en vez
  // de ir en escalones discretos por etapa activa.
  useEffect(() => {
    if (count === 0) return;
    let raf = 0;

    const compute = () => {
      raf = 0;
      const first = refs.current[0];
      const last = refs.current[refs.current.length - 1];
      if (!first || !last) return;
      const viewportCenter = window.innerHeight / 2;
      const firstTop = first.getBoundingClientRect().top;
      const lastRect = last.getBoundingClientRect();
      const lastBottom = lastRect.top + lastRect.height;
      const total = lastBottom - firstTop;
      if (total <= 0) return;
      const passed = Math.max(0, Math.min(total, viewportCenter - firstTop));
      setProgress(passed / total);
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
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

  return { active, progress, setActive, setRef, scrollTo };
}
