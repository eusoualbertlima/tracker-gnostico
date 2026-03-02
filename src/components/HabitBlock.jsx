import HabitItem from './HabitItem.jsx';

function HabitBlock({ block, habitsState, onToggle }) {
  const habits = block.habits ?? [];
  const completed = habits.filter((habit) => Boolean(habitsState?.[habit.id])).length;

  return (
    <section className="rounded-[28px] border border-white/8 bg-[var(--bg-card)]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <header className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/20 text-2xl">
          {block.icon}
        </div>
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wide text-white">{block.title}</h2>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
            {completed}/{habits.length} concluídos
          </p>
        </div>
      </header>

      <div className="space-y-3">
        {habits.map((habit) => (
          <HabitItem
            checked={Boolean(habitsState?.[habit.id])}
            habit={habit}
            key={habit.id}
            onToggle={() => onToggle(habit.id)}
          />
        ))}
      </div>
    </section>
  );
}

export default HabitBlock;
