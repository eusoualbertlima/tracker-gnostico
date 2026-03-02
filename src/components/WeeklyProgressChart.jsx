import { eachDayOfInterval, format, parseISO, startOfDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react';

function WeeklyProgressChart({ days, loading }) {
  const chartDays = useMemo(() => {
    const progressByDate = new Map(days.map((day) => [day.date, day.progress ?? 0]));
    const interval = eachDayOfInterval({
      start: subDays(startOfDay(new Date()), 6),
      end: startOfDay(new Date()),
    });

    return interval.map((date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      return {
        dateKey,
        label: format(date, 'EEEEE', { locale: ptBR }).toUpperCase(),
        progress: progressByDate.get(dateKey) ?? 0,
      };
    });
  }, [days]);

  const average = useMemo(() => {
    if (!chartDays.length) {
      return 0;
    }

    const total = chartDays.reduce((sum, day) => sum + day.progress, 0);
    return Math.round(total / chartDays.length);
  }, [chartDays]);

  const bestDay = useMemo(() => {
    if (!chartDays.length) {
      return null;
    }

    return [...chartDays].sort((a, b) => b.progress - a.progress)[0];
  }, [chartDays]);

  return (
    <section className="rounded-[28px] border border-white/8 bg-[var(--bg-card)]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
            Visualização
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Últimos 7 dias</h2>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Média</p>
          <p className="text-2xl font-extrabold text-white">{average}%</p>
        </div>
      </div>

      <div className="mt-5 flex items-end gap-3">
        {chartDays.map((day) => (
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={day.dateKey}>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
              {day.progress}%
            </span>
            <div className="flex h-36 w-full items-end rounded-[20px] bg-black/15 p-2">
              <div
                className="w-full rounded-[14px] bg-[linear-gradient(180deg,rgba(255,215,0,0.95),rgba(0,230,118,0.9))] transition-all duration-500"
                style={{ height: `${Math.max(day.progress, 8)}%` }}
              />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              {day.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
        <span>{loading ? 'Atualizando histórico...' : 'Histórico recente sincronizado.'}</span>
        <span>
          Melhor dia:{' '}
          <strong className="text-[var(--text-primary)]">
            {bestDay ? `${format(parseISO(bestDay.dateKey), 'dd/MM')} · ${bestDay.progress}%` : '--'}
          </strong>
        </span>
      </div>
    </section>
  );
}

export default WeeklyProgressChart;
