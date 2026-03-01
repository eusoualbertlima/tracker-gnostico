import { Check } from 'lucide-react';

function HabitItem({ habit, checked, onToggle }) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-[22px] border px-4 py-4 text-left transition-all duration-200 ease-in-out ${
        checked
          ? 'scale-[1.02] border-[rgba(0,230,118,0.22)] bg-[rgba(0,230,118,0.16)]'
          : 'border-white/8 bg-black/15 hover:border-white/16 hover:bg-white/4'
      }`}
      onClick={onToggle}
      type="button"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
          checked
            ? 'border-[rgba(0,230,118,0.22)] bg-[var(--accent-green)] text-black'
            : 'border-white/10 bg-white/4 text-[var(--text-muted)]'
        }`}
      >
        <Check size={18} strokeWidth={3} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-[var(--text-primary)]">{habit.label}</span>
        <span className="mt-1 block text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
          {habit.time}
        </span>
      </span>
    </button>
  );
}

export default HabitItem;
