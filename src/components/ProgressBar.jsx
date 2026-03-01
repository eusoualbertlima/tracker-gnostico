function ProgressBar({ progress, checkedCount, totalHabits }) {
  return (
    <section className="rounded-[24px] border border-white/8 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-gold)]">
            Energia do Dia
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {checkedCount} de {totalHabits} hábitos concluídos
          </p>
        </div>
        <span className="text-2xl font-extrabold text-white">{progress}%</span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-[var(--accent-gold)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
}

export default ProgressBar;
