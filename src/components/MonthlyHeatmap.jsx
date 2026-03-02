import { eachDayOfInterval, format, startOfDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react';

function getCellTone(progress) {
  if (progress >= 90) {
    return 'bg-[var(--accent-green)] text-black';
  }

  if (progress >= 70) {
    return 'bg-emerald-400/75 text-black';
  }

  if (progress >= 40) {
    return 'bg-amber-300/80 text-black';
  }

  if (progress > 0) {
    return 'bg-orange-400/75 text-black';
  }

  return 'bg-white/6 text-[var(--text-muted)]';
}

function MonthlyHeatmap({ days }) {
  const cells = useMemo(() => {
    const progressByDate = new Map(days.map((day) => [day.date, day]));
    const range = eachDayOfInterval({
      start: subDays(startOfDay(new Date()), 27),
      end: startOfDay(new Date()),
    });

    return range.map((date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const day = progressByDate.get(dateKey);
      const progress = day?.progress ?? 0;

      return {
        dateKey,
        progress,
        dayLabel: format(date, 'dd/MM', { locale: ptBR }),
        shortLabel: format(date, 'd', { locale: ptBR }),
        hasReflection: Boolean(day?.reflection?.trim()),
      };
    });
  }, [days]);

  return (
    <section className="rounded-[28px] border border-white/8 bg-[var(--bg-card)]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
            Heatmap
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Últimos 28 dias</h2>
        </div>
        <p className="text-sm text-[var(--text-muted)]">Ponto dourado = houve retrospectiva escrita</p>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2">
        {cells.map((cell) => (
          <div
            className={`relative flex h-12 items-center justify-center rounded-2xl text-xs font-semibold ${getCellTone(cell.progress)}`}
            key={cell.dateKey}
            title={`${cell.dayLabel} · ${cell.progress}%`}
          >
            {cell.shortLabel}
            {cell.hasReflection ? (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[var(--accent-gold)]" />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export default MonthlyHeatmap;
