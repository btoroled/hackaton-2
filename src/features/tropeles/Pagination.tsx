import { PAGE_SIZES, type PageSize } from "./tropelesQuery";

interface Props {
  page: number;
  size: PageSize;
  totalPages: number;
  totalElements: number;
  onPageChange: (next: number) => void;
  onSizeChange: (next: PageSize) => void;
  disabled?: boolean;
}

const btn =
  "rounded-md border border-edge bg-bg px-3 py-1.5 text-sm text-text hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40";

export function Pagination({
  page,
  size,
  totalPages,
  totalElements,
  onPageChange,
  onSizeChange,
  disabled,
}: Props) {
  const isFirst = page <= 0;
  const isLast = totalPages === 0 || page >= totalPages - 1;
  const shown = totalPages === 0 ? 0 : page + 1;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-edge bg-surface px-4 py-3 text-sm">
      <div className="flex items-center gap-3 text-muted">
        <span>
          Pagina <span className="text-text">{shown}</span> de{" "}
          <span className="text-text">{totalPages}</span>
        </span>
        <span className="text-edge">|</span>
        <span>
          <span className="text-text">{totalElements}</span> tropeles
        </span>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-muted">
          <span>Tamano</span>
          <select
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value) as PageSize)}
            disabled={disabled}
            className="rounded-md border border-edge bg-bg px-2 py-1 text-text outline-none focus:border-accent disabled:opacity-60"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={btn}
          onClick={() => onPageChange(0)}
          disabled={disabled || isFirst}
        >
          Inicio
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || isFirst}
        >
          Anterior
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || isLast}
        >
          Siguiente
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => onPageChange(Math.max(0, totalPages - 1))}
          disabled={disabled || isLast}
        >
          Final
        </button>
      </div>
    </div>
  );
}
