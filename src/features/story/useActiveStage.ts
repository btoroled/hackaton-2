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

    const visibility = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target, entry.intersectionRatio);
        }
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
        rootMargin: "-45% 0px -45% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
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
