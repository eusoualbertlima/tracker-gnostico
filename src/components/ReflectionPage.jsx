import { useMemo } from 'react';
import MetricTile from './MetricTile.jsx';
import MonthlyHeatmap from './MonthlyHeatmap.jsx';
import RetrospectivePanel from './RetrospectivePanel.jsx';
import WorkspacePageHeader from './WorkspacePageHeader.jsx';

function ReflectionCompass({ analysis }) {
  const dominantEgo = analysis?.egos?.[0] ?? null;

  return (
    <section className="rounded-[28px] border border-white/8 bg-[var(--bg-card)]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
        Leitura do momento
      </p>
      <h2 className="mt-2 text-xl font-bold text-white">
        {dominantEgo ? dominantEgo.label : 'Observação ainda sutil'}
      </h2>
      <p className="mt-3 text-sm text-[var(--text-muted)]">{analysis?.summary}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--text-primary)]">
        {dominantEgo?.practice || 'Escreva fatos, reações e justificativas para enxergar melhor os padrões.'}
      </p>
    </section>
  );
}

function WritingGuideCard() {
  return (
    <section className="rounded-[28px] border border-white/8 bg-[var(--bg-card)]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
        Método
      </p>
      <h2 className="mt-2 text-xl font-bold text-white">Como escrever melhor a retrospectiva</h2>
      <div className="mt-4 space-y-3 text-sm text-[var(--text-muted)]">
        <p>Descreva fatos concretos, sem embelezar nem justificar o que aconteceu.</p>
        <p>Nomeie a emoção dominante e o impulso que apareceu por trás dela.</p>
        <p>Registre onde você quis ter razão, fugir, controlar, se validar ou se vitimizar.</p>
      </div>
    </section>
  );
}

function ReflectionPage({ analysis, dayHasReflection, initialText, onOpenSidebar, onSave, recentDays, saving }) {
  const reflectionDays = useMemo(
    () => recentDays.filter((day) => day.reflection?.trim()).length,
    [recentDays],
  );

  const dominantEgo = analysis?.egos?.[0] ?? null;

  const recentReflectionStreak = useMemo(() => {
    let streak = 0;

    for (const day of recentDays) {
      if (!day.reflection?.trim()) {
        break;
      }

      streak += 1;
    }

    return streak;
  }, [recentDays]);

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        description="Este espaço fecha o dia. Escreva, observe o que se manifestou e deixe a leitura mais precisa ao longo do tempo."
        eyebrow="Retrospectiva"
        onOpenSidebar={onOpenSidebar}
        title="Caderno de auto-observação"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile
            label="Hoje"
            note={dayHasReflection ? 'O registro do dia já existe.' : 'Ainda falta escrever o dia.'}
            tone={dayHasReflection ? 'green' : 'amber'}
            value={dayHasReflection ? 'Escrito' : 'Aberto'}
          />
          <MetricTile
            label="Cadência"
            note="Dias seguidos escrevendo retrospectiva."
            value={recentReflectionStreak}
          />
          <MetricTile
            label="Dias escritos"
            note="Nos registros recentes."
            tone="slate"
            value={reflectionDays}
          />
          <MetricTile
            label="Ego dominante"
            note={dominantEgo ? `Intensidade ${dominantEgo.intensity}` : 'Sem leitura dominante hoje.'}
            tone="amber"
            value={dominantEgo?.label || 'Sutil'}
          />
        </div>
      </WorkspacePageHeader>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <RetrospectivePanel
          analysis={analysis}
          initialText={initialText}
          onSave={onSave}
          saving={saving}
        />

        <div className="space-y-6">
          <ReflectionCompass analysis={analysis} />
          <MonthlyHeatmap days={recentDays} />
          <WritingGuideCard />
        </div>
      </div>
    </section>
  );
}

export default ReflectionPage;
