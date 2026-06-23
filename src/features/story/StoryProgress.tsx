import type { StoryStage } from "../../api/types";
import { colorFor } from "./visualTokens";

interface Props {
  stages: StoryStage[];
  active: number;
  onJump: (index: number) => void;
}

export function StoryProgress({ stages, active, onJump }: Props) {
  const progress = stages.length > 1 ? active / (stages.length - 1) : 0;

  return (
    <div className="w-full">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="journey-bar h-full rounded-full bg-white/80"
          style={{ ["--progress" as string]: `${progress}` }}
        />
      </div>

      <ol
        className="mt-3 flex flex-wrap gap-2"
        aria-label="Etapas de la historia"
      >
        {stages.map((stage, i) => {
          const isActive = i === active;
          return (
            <li key={stage.id}>
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-current={isActive ? "step" : undefined}
                className="h-7 w-7 rounded-full border text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{
                  borderColor: isActive
                    ? colorFor(stage.colorToken)
                    : "rgba(255,255,255,0.2)",
                  background: isActive
                    ? colorFor(stage.colorToken)
                    : "transparent",
                  color: isActive ? "#0a0a0f" : "rgba(255,255,255,0.7)",
                }}
                title={stage.title}
              >
                {i + 1}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
