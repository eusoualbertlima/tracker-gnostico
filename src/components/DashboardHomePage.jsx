import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react';
import MetricTile from './MetricTile.jsx';
import ProgressBar from './ProgressBar.jsx';
import StreakBadge from './StreakBadge.jsx';
import WeeklyProgressChart from './WeeklyProgressChart.jsx';
import WorkspacePageHeader from './WorkspacePageHeader.jsx';

function TemplePulsePanel({ bestDay, highDisciplineDays, pendingCount, reflectionDays, weeklyAverage }) {
  const bestDayLabel = bestDay ? format(parseISO(bestDay.date), "dd 'de' MMM", { locale: ptBR }) : '--';

  return (
    <section className="rounded-[28px] border border-white/8 bg-[var(--bg-card)]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
            Pulso
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Leitura rápida do sistema</h2>
        </div>
        <p className="text-sm text-[var(--text-muted)]">Últimos 7 dias</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MetricTile
          label="Média semanal"
          note="Ritmo consolidado dos últimos sete dias."
          value={`${weeklyAverage}%`}
        />
        <MetricTile
          label="Dias fortes"
          note="Dias acima de 80% de cumprimento."
          tone="green"
          value={`${highDisciplineDays}/7`}
        />
        <MetricTile
          label="Melhor dia"
          note={bestDay ? `${bestDay.progress}% de execução` : 'Ainda sem histórico.'}
          tone="amber"
          value={bestDayLabel}
        />
        <MetricTile
          label="Retrospectivas"
          note="Dias com escrita nos registros recentes."
          tone="slate"
          value={reflectionDays}
        />
      </div>

      <p className="mt-4 text-sm text-[var(--text-muted)]">
        {pendingCount
          ? `${pendingCount} hábitos ainda pedem ação hoje.`
          : 'Nada pendente hoje. O templo do dia já foi selado.'}
      </p>
    </section>
  );
}

function DashboardHomePage({
  checkedCount,
  completedCount,
  dayHasReflection,
  formattedDate,
  greetingName,
  mantra,
  onOpenSidebar,
  pendingCount,
  progress,
  recentDays,
  recentDaysLoading,
  streak,
  templeName,
  totalHabits,
}) {
  const weeklyAverage = useMemo(() => {
    if (!recentDays.length) {
      return 0;
    }

    const lastSevenDays = recentDays.slice(0, 7);
    const total = lastSevenDays.reduce((sum, day) => sum + (day.progress ?? 0), 0);
    return Math.round(total / lastSevenDays.length);
  }, [recentDays]);

  const highDisciplineDays = useMemo(
    () => recentDays.slice(0, 7).filter((day) => (day.progress ?? 0) >= 80).length,
    [recentDays],
  );

  const reflectionDays = useMemo(
    () => recentDays.filter((day) => day.reflection?.trim()).length,
    [recentDays],
  );

  const bestDay = useMemo(() => {
    if (!recentDays.length) {
      return null;
    }

    return [...recentDays]
      .slice(0, 7)
      .sort((firstDay, secondDay) => (secondDay.progress ?? 0) - (firstDay.progress ?? 0))[0];
  }, [recentDays]);

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        description={`${formattedDate}. ${mantra}`}
        eyebrow={`Paz Inverencial, ${greetingName}.`}
        onOpenSidebar={onOpenSidebar}
        title={templeName}
      >
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <ProgressBar checkedCount={checkedCount} progress={progress} totalHabits={totalHabits} />
            <div>
              <StreakBadge streak={streak} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <MetricTile
              label="Pendentes"
              note="Hábitos ainda abertos no dia."
              tone="amber"
              value={pendingCount}
            />
            <MetricTile
              label="Concluídos"
              note="Hábitos já marcados hoje."
              tone="green"
              value={completedCount}
            />
            <MetricTile
              label="Média"
              note="Execução média da semana."
              value={`${weeklyAverage}%`}
            />
            <MetricTile
              label="Retrospectiva"
              note={dayHasReflection ? 'O dia já foi escrito.' : 'Ainda falta fechar o dia.'}
              tone="slate"
              value={dayHasReflection ? 'Escrita' : 'Em aberto'}
            />
          </div>
        </div>
      </WorkspacePageHeader>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <WeeklyProgressChart days={recentDays} loading={recentDaysLoading} />
        <TemplePulsePanel
          bestDay={bestDay}
          highDisciplineDays={highDisciplineDays}
          pendingCount={pendingCount}
          reflectionDays={reflectionDays}
          weeklyAverage={weeklyAverage}
        />
      </div>
    </section>
  );
}

export default DashboardHomePage;
