import {
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfDay,
  startOfWeek,
  subDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react';
import MetricTile from './MetricTile.jsx';
import WorkspacePageHeader from './WorkspacePageHeader.jsx';

function getTone(progress) {
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

function buildRangeDays(days, amount) {
  const interval = eachDayOfInterval({
    start: subDays(startOfDay(new Date()), amount - 1),
    end: startOfDay(new Date()),
  });
  const dayMap = new Map(days.map((day) => [day.date, day]));

  return interval.map((date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const source = dayMap.get(dateKey);

    return {
      date,
      dateKey,
      habits: source?.habits ?? {},
      progress: source?.progress ?? 0,
      reflection: source?.reflection ?? '',
    };
  });
}

function getAverage(days) {
  if (!days.length) {
    return 0;
  }

  const total = days.reduce((sum, day) => sum + (day.progress ?? 0), 0);
  return Math.round(total / days.length);
}

function getReflectionRate(days) {
  if (!days.length) {
    return 0;
  }

  const reflectionDays = days.filter((day) => day.reflection?.trim()).length;
  return Math.round((reflectionDays / days.length) * 100);
}

function getBestRun(days) {
  let current = 0;
  let best = 0;

  for (const day of days) {
    if ((day.progress ?? 0) >= 80) {
      current += 1;
      best = Math.max(best, current);
      continue;
    }

    current = 0;
  }

  return best;
}

function WeeklyArchive({ weeks }) {
  return (
    <section className="rounded-[28px] border border-white/8 bg-[var(--bg-card)]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
            Semanas
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Ritmo das ultimas 8 semanas</h2>
        </div>
        <p className="text-sm text-[var(--text-muted)]">Barra = media semanal</p>
      </div>

      <div className="mt-6 flex items-end gap-3">
        {weeks.map((week) => (
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={week.label}>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
              {week.average}%
            </span>
            <div className="flex h-44 w-full items-end rounded-[20px] bg-black/15 p-2">
              <div
                className="w-full rounded-[14px] bg-[linear-gradient(180deg,rgba(255,215,0,0.95),rgba(0,230,118,0.9))] transition-all duration-500"
                style={{ height: `${Math.max(week.average, 8)}%` }}
              />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              {week.shortLabel}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">{week.reflections}/7 retro</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArchiveHeatmap({ days }) {
  return (
    <section className="rounded-[28px] border border-white/8 bg-[var(--bg-card)]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
            Arquivo
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Ultimos 84 dias</h2>
        </div>
        <p className="text-sm text-[var(--text-muted)]">Ponto dourado = houve retrospectiva</p>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            className={`relative flex h-10 items-center justify-center rounded-2xl text-[11px] font-semibold ${getTone(day.progress)}`}
            key={day.dateKey}
            title={`${format(day.date, 'dd/MM')} · ${day.progress}%`}
          >
            {format(day.date, 'd', { locale: ptBR })}
            {day.reflection?.trim() ? (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[var(--accent-gold)]" />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function BlockReportPanel({ blocks, days }) {
  const blockSummaries = useMemo(() => {
    return blocks
      .map((block) => {
        const habits = block.habits ?? [];
        const possible = habits.length * days.length;
        const completed = days.reduce((sum, day) => {
          return (
            sum +
            habits.reduce((blockSum, habit) => blockSum + (day.habits?.[habit.id] ? 1 : 0), 0)
          );
        }, 0);
        const score = possible ? Math.round((completed / possible) * 100) : 0;
        const activeDays = days.filter((day) =>
          habits.some((habit) => Boolean(day.habits?.[habit.id])),
        ).length;

        return {
          id: block.id,
          label: `${block.icon} ${block.title}`,
          score,
          activeDays,
        };
      })
      .sort((firstBlock, secondBlock) => secondBlock.score - firstBlock.score);
  }, [blocks, days]);

  return (
    <section className="rounded-[28px] border border-white/8 bg-[var(--bg-card)]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
            Blocos
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Performance por bloco nos ultimos 30 dias</h2>
        </div>
        <p className="text-sm text-[var(--text-muted)]">Taxa de execucao por estrutura</p>
      </div>

      <div className="mt-5 space-y-3">
        {blockSummaries.map((block) => (
          <article
            className="rounded-[24px] border border-white/8 bg-black/15 px-4 py-4"
            key={block.id}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{block.label}</p>
              <p className="text-lg font-extrabold text-white">{block.score}%</p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(255,215,0,0.95),rgba(0,230,118,0.9))]"
                style={{ width: `${block.score}%` }}
              />
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {block.activeDays} dias com atividade registrada
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function HabitReliabilityPanel({ blocks, days }) {
  const habitSummaries = useMemo(() => {
    return blocks
      .flatMap((block) =>
        (block.habits ?? []).map((habit) => {
          const completed = days.reduce(
            (sum, day) => sum + (day.habits?.[habit.id] ? 1 : 0),
            0,
          );
          const score = days.length ? Math.round((completed / days.length) * 100) : 0;
          let currentRun = 0;

          for (let index = days.length - 1; index >= 0; index -= 1) {
            if (!days[index].habits?.[habit.id]) {
              break;
            }

            currentRun += 1;
          }

          return {
            id: habit.id,
            label: habit.label,
            blockLabel: `${block.icon} ${block.title}`,
            currentRun,
            score,
          };
        }),
      )
      .sort((firstHabit, secondHabit) => secondHabit.score - firstHabit.score);
  }, [blocks, days]);

  const strongest = habitSummaries.slice(0, 4);
  const weakest = [...habitSummaries].reverse().slice(0, 4);

  function HabitRow({ habit, tone }) {
    return (
      <article className="rounded-[22px] border border-white/8 bg-black/15 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{habit.label}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {habit.blockLabel}
            </p>
          </div>
          <p className={`text-lg font-extrabold ${tone}`}>{habit.score}%</p>
        </div>
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
          corrida atual: {habit.currentRun} dias
        </p>
      </article>
    );
  }

  return (
    <section className="rounded-[28px] border border-white/8 bg-[var(--bg-card)]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
          Habitos
        </p>
        <h2 className="mt-2 text-xl font-bold text-white">Confiabilidade nos ultimos 30 dias</h2>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-green)]">
            Mais estaveis
          </p>
          {strongest.map((habit) => (
            <HabitRow habit={habit} key={habit.id} tone="text-[var(--accent-green)]" />
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
            Pedem reforco
          </p>
          {weakest.map((habit) => (
            <HabitRow habit={habit} key={habit.id} tone="text-amber-200" />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReportsPage({ blocks, days, loading, onOpenSidebar }) {
  const timeline90 = useMemo(() => buildRangeDays(days, 90), [days]);
  const timeline84 = useMemo(() => timeline90.slice(-84), [timeline90]);
  const window30 = useMemo(() => timeline90.slice(-30), [timeline90]);
  const window60 = useMemo(() => timeline90.slice(-60), [timeline90]);

  const average30 = useMemo(() => getAverage(window30), [window30]);
  const average60 = useMemo(() => getAverage(window60), [window60]);
  const reflectionRate90 = useMemo(() => getReflectionRate(timeline90), [timeline90]);
  const bestRun = useMemo(() => getBestRun(timeline90), [timeline90]);

  const weeklyWindows = useMemo(() => {
    const items = [];
    const currentWeekStart = startOfWeek(startOfDay(new Date()), { weekStartsOn: 1 });

    for (let offset = 7; offset >= 0; offset -= 1) {
      const weekStart = subDays(currentWeekStart, offset * 7);
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const daysInWeek = timeline90.filter((day) => day.date >= weekStart && day.date <= weekEnd);

      items.push({
        average: getAverage(daysInWeek),
        label: format(weekStart, 'yyyy-MM-dd'),
        reflections: daysInWeek.filter((day) => day.reflection?.trim()).length,
        shortLabel: format(weekStart, 'dd/MM', { locale: ptBR }),
      });
    }

    return items;
  }, [timeline90]);

  const strongestWeek = useMemo(() => {
    if (!weeklyWindows.length) {
      return null;
    }

    return [...weeklyWindows].sort((firstWeek, secondWeek) => secondWeek.average - firstWeek.average)[0];
  }, [weeklyWindows]);

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        description="Aqui a visao sai do dia e entra no ciclo. O objetivo e enxergar tendencia, estabilidade e pontos que merecem ajuste estrutural."
        eyebrow="Historico"
        onOpenSidebar={onOpenSidebar}
        title="Relatorios de medio prazo"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile
            label="Media 30d"
            note="Execucao media do ultimo mes."
            value={`${average30}%`}
          />
          <MetricTile
            label="Media 60d"
            note="Sustentacao do sistema em prazo maior."
            tone="slate"
            value={`${average60}%`}
          />
          <MetricTile
            label="Retrospectiva 90d"
            note="Dias com escrita no periodo."
            tone="amber"
            value={`${reflectionRate90}%`}
          />
          <MetricTile
            label="Melhor corrida"
            note="Sequencia de dias com 80% ou mais."
            tone="green"
            value={bestRun}
          />
        </div>
      </WorkspacePageHeader>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <WeeklyArchive weeks={weeklyWindows} />
        <section className="rounded-[28px] border border-white/8 bg-[var(--bg-card)]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
                Leitura
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">Resumo executivo</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)]">{loading ? 'Atualizando...' : 'Sincronizado'}</p>
          </div>

          <div className="mt-5 grid gap-3">
            <article className="rounded-[24px] border border-white/8 bg-black/15 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Melhor semana
              </p>
              <p className="mt-2 text-lg font-bold text-white">
                {strongestWeek ? `${strongestWeek.shortLabel} · ${strongestWeek.average}%` : '--'}
              </p>
            </article>
            <article className="rounded-[24px] border border-white/8 bg-black/15 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Tendencia do mes
              </p>
              <p className="mt-2 text-sm text-[var(--text-primary)]">
                {average30 >= average60
                  ? 'O ultimo mes esta acima da media estrutural. Houve ganho real de cadencia.'
                  : 'O ultimo mes ficou abaixo da base dos 60 dias. Vale revisar excesso, dispersao ou horarios.'}
              </p>
            </article>
            <article className="rounded-[24px] border border-white/8 bg-black/15 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Escrita e observacao
              </p>
              <p className="mt-2 text-sm text-[var(--text-primary)]">
                {reflectionRate90 >= 60
                  ? 'A retrospectiva esta sustentando a leitura interna com boa frequencia.'
                  : 'A cadencia de retrospectiva ainda esta baixa para gerar leitura profunda dos padroes.'}
              </p>
            </article>
          </div>
        </section>
      </div>

      <ArchiveHeatmap days={timeline84} />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <BlockReportPanel blocks={blocks} days={window30} />
        <HabitReliabilityPanel blocks={blocks} days={window30} />
      </div>
    </section>
  );
}

export default ReportsPage;
