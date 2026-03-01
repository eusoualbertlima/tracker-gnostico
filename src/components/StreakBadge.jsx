function StreakBadge({ streak }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,215,0,0.18)] bg-[rgba(255,215,0,0.08)] px-4 py-2 text-sm font-semibold text-[var(--accent-gold)]">
      <span>🔥</span>
      <span>{streak} dias consecutivos</span>
    </div>
  );
}

export default StreakBadge;
