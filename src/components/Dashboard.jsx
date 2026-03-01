import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LogOut, Settings } from 'lucide-react';
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useHabitConfig } from '../hooks/useHabitConfig.js';
import { useHabits } from '../hooks/useHabits.js';
import { toggleHabit } from '../services/habitService.js';
import HabitBlock from './HabitBlock.jsx';
import ProgressBar from './ProgressBar.jsx';
import StreakBadge from './StreakBadge.jsx';

function Dashboard({ onOpenSettings }) {
  const { user, logout } = useAuth();
  const { config, loading: configLoading, error: configError } = useHabitConfig(user?.uid);
  const blocks = config?.blocks ?? [];
  const { day, streak, loading: dayLoading, error: dayError, totalHabits, dateKey } = useHabits(
    user?.uid,
    blocks,
  );

  const checkedCount = useMemo(
    () => Object.values(day?.habits ?? {}).filter(Boolean).length,
    [day],
  );
  const progress = day?.progress ?? 0;
  const formattedDate = format(new Date(), "dd 'de' MMMM, yyyy (EEEE)", { locale: ptBR });

  async function handleToggle(habitId) {
    await toggleHabit(user.uid, dateKey, habitId);
  }

  return (
    <section className="panel screen-fade space-y-6">
      <header className="glass-panel p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--accent-gold)]">
              Paz Inverencial, Albert.
            </p>
            <h1 className="mt-3 text-3xl font-extrabold text-white">O Templo Digital</h1>
            <p className="mt-2 text-sm capitalize text-[var(--text-muted)]">{formattedDate}</p>
          </div>
          <div className="flex gap-2">
            <button className="ghost-button" onClick={onOpenSettings} type="button">
              <Settings size={18} />
            </button>
            <button className="ghost-button" onClick={logout} type="button">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <ProgressBar checkedCount={checkedCount} progress={progress} totalHabits={totalHabits} />
          <StreakBadge streak={streak} />
        </div>
      </header>

      {configLoading || dayLoading ? (
        <p className="text-sm text-[var(--text-muted)]">Sincronizando hábitos do dia...</p>
      ) : null}
      {configError ? <p className="text-sm text-[var(--danger)]">{configError}</p> : null}
      {dayError ? <p className="text-sm text-[var(--danger)]">{dayError}</p> : null}

      <div className="space-y-6">
        {blocks.map((block) => (
          <HabitBlock
            block={block}
            habitsState={day?.habits}
            key={block.id}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </section>
  );
}

export default Dashboard;
