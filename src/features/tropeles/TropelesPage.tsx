import { useMemo } from "react";
import { TropelFilters } from "./TropelFilters";
import { TropelesTable } from "./TropelesTable";
import { Pagination } from "./Pagination";
import {
  urlStateToQuery,
  useTropelesUrlState,
} from "./tropelesQuery";
import { useTropelesData } from "./useTropelesData";

export function TropelesPage() {
  const controls = useTropelesUrlState();
  const query = useMemo(() => urlStateToQuery(controls.state), [controls.state]);
  const { status, data, error, isFetching, refetch } = useTropelesData(query);

  const rows = data?.content ?? [];

  return (
    <section className="min-h-[640px]">
      <header className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl text-text">Atlas de Tropeles</h1>
          <p className="text-sm text-muted">
            Paginacion del servidor, filtros, busqueda y orden sincronizados con la URL.
          </p>
        </div>
      </header>

      <TropelFilters controls={controls} />

      <TropelesTable
        rows={rows}
        placeholderRows={controls.state.size}
        state={status}
        error={error}
        onRetry={refetch}
      />

      <Pagination
        page={controls.state.page}
        size={controls.state.size}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements ?? 0}
        onPageChange={controls.setPage}
        onSizeChange={controls.setSize}
        disabled={isFetching && rows.length === 0}
      />
    </section>
  );
}
