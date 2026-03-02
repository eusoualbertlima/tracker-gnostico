import HabitItem from './HabitItem.jsx';

function HabitColumn({ emptyLabel, items, onToggle, title, tone }) {
  return (
    <section className="rounded-[28px] border border-white/8 bg-[var(--bg-card)]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${tone}`}>{title}</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{items.length} hábitos</p>
        </div>
      </div>

      {items.length ? (
        <div className="mt-4 space-y-3">
          {items.map((habit) => (
            <HabitItem
              checked={habit.checked}
              habit={habit}
              key={habit.id}
              meta={`${habit.blockIcon} ${habit.blockTitle}`}
              onToggle={() => onToggle(habit.id)}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-[22px] border border-white/8 bg-black/15 px-4 py-4 text-sm text-[var(--text-muted)]">
          {emptyLabel}
        </p>
      )}
    </section>
  );
}

function FocusBoard({ completedHabits, pendingHabits, onToggle }) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
          Visão do Dia
        </p>
        <h2 className="mt-2 text-xl font-bold text-white">O que ainda pede ação e o que já foi selado</h2>
      </div>

      <div className="grid gap-4">
        <HabitColumn
          emptyLabel="Nada pendente. O templo do dia já foi concluído."
          items={pendingHabits}
          onToggle={onToggle}
          title="Pendentes"
          tone="text-amber-300"
        />
        <HabitColumn
          emptyLabel="Nenhum hábito concluído ainda. Comece pelo primeiro bloco."
          items={completedHabits}
          onToggle={onToggle}
          title="Concluídos"
          tone="text-[var(--accent-green)]"
        />
      </div>
    </section>
  );
}

export default FocusBoard;
