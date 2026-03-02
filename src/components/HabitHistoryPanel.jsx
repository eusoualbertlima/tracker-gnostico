import { format, parseISO } from 'date-fns';
import { useMemo } from 'react';

function HabitHistoryPanel({ days, habitId, habits, onHabitChange }) {
  const selectedHabit = useMemo(
    () => habits.find((habit) => habit.id === habitId) ?? habits[0] ?? null,
    [habitId, habits],
  );

  const history = useMemo(() => {
    if (!selectedHabit) {
      return [];
    }

    return [...days]
      .slice()
      .reverse()
      .map((day) => ({
        date: day.date,
        checked: Boolean(day.habits?.[selectedHabit.id]),
        progress: day.progress ?? 0,
      }))
      .slice(-14);
  }, [days, selectedHabit]);

  const consistency = useMemo(() => {
    if (!history.length) {
      return 0;
    }

    const done = history.filter((item) => item.checked).length;
    return Math.round((done / history.length) * 100);
  }, [history]);

  if (!selectedHabit) {
    return null;
  }

  return (
    <section className="rounded-[28px] border border-white/8 bg-[var(--bg-card)]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
            Histórico
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Consistência por hábito</h2>
        </div>
        <p className="text-2xl font-extrabold text-white">{consistency}%</p>
      </div>

      <select
        className="mt-4 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-gold)]"
        onChange={(event) => onHabitChange(event.target.value)}
        value={selectedHabit.id}
      >
        {habits.map((habit) => (
          <option key={habit.id} value={habit.id}>
            {habit.blockIcon} {habit.label}
          </option>
        ))}
      </select>

      <div className="mt-4">
        <p className="text-sm font-medium text-[var(--text-primary)]">{selectedHabit.label}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
          {selectedHabit.blockIcon} {selectedHabit.blockTitle} · {selectedHabit.time}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2">
        {history.map((item) => (
          <div
            className={`rounded-2xl px-2 py-3 text-center text-xs font-semibold ${
              item.checked
                ? 'bg-[rgba(0,230,118,0.16)] text-[var(--accent-green)]'
                : 'bg-white/6 text-[var(--text-muted)]'
            }`}
            key={item.date}
            title={`${item.date} · ${item.checked ? 'cumprido' : 'não cumprido'}`}
          >
            <div>{format(parseISO(item.date), 'dd')}</div>
            <div className="mt-1 text-[10px]">{item.checked ? 'OK' : '--'}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HabitHistoryPanel;
