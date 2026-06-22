import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { USING_MOCK } from "../../lib/api";
import { useSectorStory } from "./useSectorStory";
import { useActiveStage } from "./useActiveStage";
import StoryVisual from "./StoryVisual";
import StoryProgress from "./StoryProgress";
import { withViewTransition } from "./viewTransition";
import { climateGradient, colorFor } from "./visualTokens";
import type { SectorStoryResponse } from "../../types";
import "./story.css";

type Mode = "summary" | "story";

export default function SectorStoryPage() {
  const { id } = useParams<{ id: string }>();
  const story = useSectorStory(id);

  if (story.status === "loading") {
    return <CenterMessage>Cargando historia del sector...</CenterMessage>;
  }

  if (story.status === "error") {
    return (
      <CenterMessage>
        <p className="mb-4 text-rose-400">{story.message}</p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={story.reload}
            className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
          >
            Reintentar
          </button>
          <Link to="/sectors" className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">
            Volver
          </Link>
        </div>
      </CenterMessage>
    );
  }

  return <StoryView data={story.data} />;
}

function StoryView({ data }: { data: SectorStoryResponse }) {
  const { sector, stages } = data;
  const [mode, setMode] = useState<Mode>("summary");
  const { active, setRef, scrollTo } = useActiveStage(stages.length);
  const activeStage = stages[active];

  const toStory = useCallback(() => {
    withViewTransition(() => setMode("story"));
  }, []);
  const toSummary = useCallback(() => {
    withViewTransition(() => setMode("summary"));
  }, []);

  // Navegacion por teclado entre etapas sin perder contenido.
  useEffect(() => {
    if (mode !== "story") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollTo(Math.min(active + 1, stages.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollTo(Math.max(active - 1, 0));
      } else if (e.key === "Home") {
        e.preventDefault();
        scrollTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        scrollTo(stages.length - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, active, stages.length, scrollTo]);

  if (mode === "summary") {
    return (
      <main className="mx-auto min-h-dvh max-w-3xl px-6 py-16">
        {USING_MOCK && <MockBanner />}
        <Link to="/sectors" className="text-sm text-white/50 hover:text-white">
          ‹ Sectores
        </Link>
        <div
          className="mt-6 rounded-3xl border border-white/10 p-8"
          style={{ background: climateGradient(sector.climate), viewTransitionName: "sector-hero" }}
        >
          <p className="text-xs uppercase tracking-widest text-white/60">
            {sector.climate.replace("_", " ")}
          </p>
          <h1 className="mt-2 text-4xl font-bold">{sector.name}</h1>
          <p className="mt-4 max-w-prose text-white/70">
            Recorrido de {stages.length} etapas que narra la evolucion del sector,
            desde el primer pulso hasta su nuevo equilibrio.
          </p>
          <button
            type="button"
            onClick={toStory}
            className="mt-8 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Iniciar recorrido →
          </button>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stages.map((s) => (
            <li
              key={s.id}
              className="rounded-xl border border-white/10 p-3 text-sm"
              style={{ borderColor: colorFor(s.colorToken) }}
            >
              <span className="text-white/50">Etapa {s.order + 1}</span>
              <p className="font-medium">{s.title}</p>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <main className="relative" style={{ viewTransitionName: "sector-hero" }}>
      {USING_MOCK && <MockBanner />}

      {/* Cabecera fija con progreso */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0a0f]/90 px-4 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={toSummary}
              className="text-sm text-white/60 hover:text-white"
            >
              ‹ Resumen
            </button>
            <h1 className="text-sm font-semibold">{sector.name}</h1>
          </div>
          <StoryProgress stages={stages} active={active} onJump={scrollTo} />
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-8 lg:grid-cols-2">
        {/* Visual persistente sticky */}
        <div className="order-1 lg:order-2">
          <div className="sticky top-28 h-[60vh] lg:h-[70vh]">
            <StoryVisual sector={sector} stage={activeStage} total={stages.length} />
          </div>
        </div>

        {/* Narrativa por etapas activadas por scroll */}
        <ol className="order-2 lg:order-1">
          {stages.map((stage, i) => (
            <li
              key={stage.id}
              ref={setRef(i)}
              tabIndex={0}
              aria-current={i === active ? "step" : undefined}
              className="flex min-h-[70vh] flex-col justify-center rounded-2xl px-2 py-10 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{ opacity: i === active ? 1 : 0.45 }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: colorFor(stage.colorToken) }}
              >
                Etapa {stage.order + 1} · {stage.dominantEvent.replace("_", " ")}
              </span>
              <h2 className="mt-2 text-3xl font-bold">{stage.title}</h2>
              <p className="mt-4 max-w-prose text-lg leading-relaxed text-white/80">
                {stage.narrative}
              </p>
              <dl className="mt-6 flex gap-6 text-sm">
                <Stat label="Estabilidad" value={stage.metrics.stability} />
                <Stat label="Energia" value={stage.metrics.energy} />
                <Stat label="Alertas" value={stage.metrics.alerts} />
              </dl>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-white/50">{label}</dt>
      <dd className="text-xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}

function CenterMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>{children}</div>
    </div>
  );
}

function MockBanner() {
  return (
    <div className="bg-amber-500/20 px-4 py-1.5 text-center text-xs text-amber-200">
      Modo demo (datos mock). Configura VITE_API_BASE_URL para usar la API real.
    </div>
  );
}
