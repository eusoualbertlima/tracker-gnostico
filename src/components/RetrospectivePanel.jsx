import { useEffect, useEffectEvent, useState } from 'react';

function EgoChip({ ego }) {
  const tone =
    ego.intensity === 'alta'
      ? 'border-red-300/30 bg-red-300/12 text-red-100'
      : ego.intensity === 'media'
        ? 'border-amber-300/30 bg-amber-300/10 text-amber-100'
        : 'border-white/10 bg-white/5 text-[var(--text-primary)]';

  return (
    <article className={`rounded-[24px] border p-4 ${tone}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-[0.18em]">{ego.label}</h3>
        <span className="text-[10px] uppercase tracking-[0.2em]">{ego.intensity}</span>
      </div>
      <p className="mt-2 text-sm">{ego.summary}</p>
      {ego.evidence?.length ? (
        <div className="mt-3 space-y-2 text-xs opacity-90">
          {ego.evidence.map((item) => (
            <p className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2" key={item}>
              "{item}"
            </p>
          ))}
        </div>
      ) : null}
      <p className="mt-3 text-xs uppercase tracking-[0.16em] opacity-90">{ego.practice}</p>
    </article>
  );
}

function RetrospectivePanel({ analysis, initialText, onSave, saving }) {
  const [text, setText] = useState(initialText ?? '');
  const [lastSavedText, setLastSavedText] = useState(initialText ?? '');
  const saveDraft = useEffectEvent(async (nextText) => {
    await onSave(nextText);
    setLastSavedText(nextText);
  });

  useEffect(() => {
    setText(initialText ?? '');
    setLastSavedText(initialText ?? '');
  }, [initialText]);

  useEffect(() => {
    if (text === lastSavedText) {
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      await saveDraft(text);
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [lastSavedText, text]);

  return (
    <section className="rounded-[28px] border border-white/8 bg-[var(--bg-card)]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
            Retrospectiva
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Escreva o que viu em si hoje</h2>
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
          {saving ? 'Analisando...' : 'Autoanálise ativa'}
        </span>
      </div>

      <textarea
        className="mt-4 min-h-40 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-white outline-none transition focus:border-[var(--accent-gold)]"
        onChange={(event) => setText(event.target.value)}
        placeholder="Ex.: Fiquei irritado numa conversa, quis ter razão, adiei uma tarefa importante e procurei validação no olhar dos outros..."
        value={text}
      />

      <div className="mt-4 space-y-3">
        <div className="rounded-[22px] border border-white/8 bg-black/15 px-4 py-4">
          <p className="text-sm font-medium text-[var(--text-primary)]">{analysis?.summary}</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{analysis?.disclaimer}</p>
        </div>

        {analysis?.egos?.length ? (
          <div className="grid gap-3">
            {analysis.egos.map((ego) => (
              <EgoChip ego={ego} key={ego.id} />
            ))}
          </div>
        ) : (
          <p className="rounded-[22px] border border-white/8 bg-black/15 px-4 py-4 text-sm text-[var(--text-muted)]">
            Quando você descrever fatos concretos, reações, justificativas e impulsos, a leitura dos egos
            fica mais nítida.
          </p>
        )}
      </div>
    </section>
  );
}

export default RetrospectivePanel;
