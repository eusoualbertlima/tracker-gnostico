function HabitFilters({
  blockFilter,
  blocks,
  searchValue,
  statusFilter,
  timeFilter,
  onBlockFilterChange,
  onSearchChange,
  onStatusFilterChange,
  onTimeFilterChange,
}) {
  return (
    <section className="rounded-[28px] border border-white/8 bg-[var(--bg-card)]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
          Filtros
        </p>
        <h2 className="mt-2 text-xl font-bold text-white">Explorar hábitos com mais ordem</h2>
      </div>

      <div className="mt-4 grid gap-3">
        <input
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-gold)]"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar hábito..."
          value={searchValue}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <select
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-gold)]"
            onChange={(event) => onStatusFilterChange(event.target.value)}
            value={statusFilter}
          >
            <option value="all">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="completed">Concluídos</option>
          </select>

          <select
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-gold)]"
            onChange={(event) => onBlockFilterChange(event.target.value)}
            value={blockFilter}
          >
            <option value="all">Todos os blocos</option>
            {blocks.map((block) => (
              <option key={block.id} value={block.id}>
                {block.icon} {block.title}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-gold)]"
            onChange={(event) => onTimeFilterChange(event.target.value)}
            value={timeFilter}
          >
            <option value="all">Qualquer horário</option>
            <option value="morning">Manhã</option>
            <option value="afternoon">Tarde</option>
            <option value="night">Noite</option>
            <option value="timeless">Dia todo</option>
          </select>
        </div>
      </div>
    </section>
  );
}

export default HabitFilters;
