const TONE_CLASSES = {
  amber: 'text-amber-100',
  gold: 'text-[var(--accent-gold)]',
  green: 'text-[var(--accent-green)]',
  slate: 'text-[var(--text-primary)]',
};

function MetricTile({ label, note, tone = 'gold', value }) {
  return (
    <article className="rounded-[24px] border border-white/8 bg-black/20 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className={`mt-3 text-2xl font-extrabold ${TONE_CLASSES[tone] ?? TONE_CLASSES.gold}`}>{value}</p>
      {note ? <p className="mt-2 text-sm text-[var(--text-muted)]">{note}</p> : null}
    </article>
  );
}

export default MetricTile;
