import FocusBoard from './FocusBoard.jsx';
import HabitBlock from './HabitBlock.jsx';
import HabitFilters from './HabitFilters.jsx';
import HabitHistoryPanel from './HabitHistoryPanel.jsx';
import MetricTile from './MetricTile.jsx';
import WorkspacePageHeader from './WorkspacePageHeader.jsx';

function HabitsPage({
  blockFilter,
  blocks,
  completedHabits,
  days,
  filteredBlocks,
  filteredHabits,
  habitsState,
  onBlockFilterChange,
  onHabitChange,
  onOpenSidebar,
  onSearchChange,
  onStatusFilterChange,
  onTimeFilterChange,
  onToggle,
  pendingHabits,
  selectedHabitId,
}) {
  const historyHabits = filteredHabits.length ? filteredHabits : [...pendingHabits, ...completedHabits];

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        description="Aqui fica a operação do dia: filtrar, executar, revisar consistência e enxergar os blocos com clareza."
        eyebrow="Hábitos"
        onOpenSidebar={onOpenSidebar}
        title="Mapa operacional dos hábitos"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="Visíveis" note="Hábitos após aplicar filtros." tone="slate" value={filteredHabits.length} />
          <MetricTile label="Pendentes" note="Ainda pedem ação hoje." tone="amber" value={pendingHabits.length} />
          <MetricTile label="Concluídos" note="Já foram selados hoje." tone="green" value={completedHabits.length} />
          <MetricTile label="Blocos ativos" note="Blocos com hábitos visíveis." value={filteredBlocks.length || blocks.length} />
        </div>
      </WorkspacePageHeader>

      <HabitFilters
        blockFilter={blockFilter}
        blocks={blocks}
        onBlockFilterChange={onBlockFilterChange}
        onSearchChange={onSearchChange}
        onStatusFilterChange={onStatusFilterChange}
        onTimeFilterChange={onTimeFilterChange}
        searchValue={searchValue}
        statusFilter={statusFilter}
        timeFilter={timeFilter}
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <FocusBoard
            completedHabits={completedHabits}
            onToggle={onToggle}
            pendingHabits={pendingHabits}
          />

          <HabitHistoryPanel
            days={days}
            habitId={selectedHabitId}
            habits={historyHabits}
            onHabitChange={onHabitChange}
          />
        </div>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
              Por Blocos
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">Arquitetura completa do dia</h2>
          </div>

          {filteredBlocks.length ? (
            <div className="grid gap-6 2xl:grid-cols-2">
              {filteredBlocks.map((block) => (
                <HabitBlock
                  block={block}
                  habitsState={habitsState}
                  key={block.id}
                  onToggle={onToggle}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-[24px] border border-white/8 bg-black/15 px-4 py-4 text-sm text-[var(--text-muted)]">
              Nenhum hábito encontrado com os filtros atuais.
            </p>
          )}
        </section>
      </div>
    </section>
  );
}

export default HabitsPage;
