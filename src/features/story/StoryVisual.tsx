import type { StorySector, StoryStage } from "../../api/types";
import { climateGradient, colorFor } from "./visualTokens";

interface Props {
  sector: StorySector;
  stage: StoryStage;
  total: number;
}

export function StoryVisual({ sector, stage, total }: Props) {
  const accent = colorFor(stage.colorToken);

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10"
      style={{ background: climateGradient(sector.climate) }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 grid place-items-center">
        <div
          className="visual-core"
          style={{
            ["--size" as string]: `${120 + stage.metrics.energy * 1.6}px`,
            ["--accent" as string]: accent,
          }}
        />
        {Array.from({ length: Math.min(stage.metrics.alerts, 6) }).map(
          (_, i) => (
            <span
              key={i}
              className="visual-ring"
              style={{
                ["--accent" as string]: accent,
                ["--ring" as string]: `${i}`,
                width: `${180 + i * 70}px`,
                height: `${180 + i * 70}px`,
              }}
            />
          ),
        )}
      </div>

      <div className="absolute left-4 top-4 text-xs uppercase tracking-widest text-white/60">
        {sector.climate.replace("_", " ")}
      </div>
      <div className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs text-white/70">
        Etapa {stage.order + 1}/{total}
      </div>
      <div className="absolute bottom-4 left-4 font-mono text-[11px] text-white/40">
        {stage.assetKey}
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <Metric label="STA" value={stage.metrics.stability} accent={accent} />
        <Metric label="ENE" value={stage.metrics.energy} accent={accent} />
        <Metric label="ALR" value={stage.metrics.alerts} accent={accent} />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-lg bg-black/45 px-3 py-2 text-center backdrop-blur">
      <div
        className="text-lg font-bold tabular-nums"
        style={{ color: accent }}
      >
        {value}
      </div>
      <div className="text-[10px] tracking-widest text-white/50">{label}</div>
    </div>
  );
}
