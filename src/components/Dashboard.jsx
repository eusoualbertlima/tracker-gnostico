import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LogOut, Settings } from 'lucide-react';
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useHabitConfig } from '../hooks/useHabitConfig.js';
import { useHabits } from '../hooks/useHabits.js';
import { useRecentProgress } from '../hooks/useRecentProgress.js';
import { useUserProfile } from '../hooks/useUserProfile.js';
import { toggleHabit } from '../services/habitService.js';
import FocusBoard from './FocusBoard.jsx';
import HabitBlock from './HabitBlock.jsx';
import ProgressBar from './ProgressBar.jsx';
import StreakBadge from './StreakBadge.jsx';
import WeeklyProgressChart from './WeeklyProgressChart.jsx';

function getGreetingName(user, profile) {
  return profile?.displayName?.trim() || user?.displayName?.trim()?.split(/\s+/)[0] || 'Buscador';
}

function getTimeRank(time) {
  const match = /^(\d{2}):(\d{2})$/.exec(time ?? '');

  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function Dashboard({ onOpenSettings }) {
  const { user, logout } = useAuth();
  const { config, loading: configLoading, error: configError } = useHabitConfig(user?.uid);
  const { profile, loading: profileLoading, error: profileError } = useUserProfile(user?.uid);
  const { days: recentDays, loading: recentDaysLoading, error: recentDaysError } = useRecentProgress(
    user?.uid,
    7,
  );
  const blocks = useMemo(() => config?.blocks ?? [], [config]);
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
  const templeName = profile?.templeName?.trim() || 'Templo Digital';
  const mantra = profile?.mantra?.trim() || 'Disciplina, presença e serviço.';
  const organizedHabits = useMemo(
    () =>
      blocks
        .flatMap((block) =>
          (block.habits ?? []).map((habit) => ({
            ...habit,
            blockId: block.id,
            blockTitle: block.title,
            blockIcon: block.icon,
            checked: Boolean(day?.habits?.[habit.id]),
            blockOrder: block.order ?? 0,
          })),
        )
        .sort((a, b) => {
          const timeDiff = getTimeRank(a.time) - getTimeRank(b.time);

          if (timeDiff !== 0) {
            return timeDiff;
          }

          return a.blockOrder - b.blockOrder;
        }),
    [blocks, day],
  );
  const pendingHabits = useMemo(
    () => organizedHabits.filter((habit) => !habit.checked),
    [organizedHabits],
  );
  const completedHabits = useMemo(
    () => organizedHabits.filter((habit) => habit.checked),
    [organizedHabits],
  );

  async function handleToggle(habitId) {
    await toggleHabit(user.uid, dateKey, habitId);
  }

  return (
    <section className="panel screen-fade space-y-6">
      <header className="glass-panel p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--accent-gold)]">
              Paz Inverencial, {getGreetingName(user, profile)}.
            </p>
            <h1 className="mt-3 text-3xl font-extrabold text-white">{templeName}</h1>
            <p className="mt-2 text-sm capitalize text-[var(--text-muted)]">{formattedDate}</p>
            <p className="mt-3 max-w-[22rem] text-sm text-[var(--text-muted)]">{mantra}</p>
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

      {configLoading || dayLoading || profileLoading ? (
        <p className="text-sm text-[var(--text-muted)]">Sincronizando hábitos do dia...</p>
      ) : null}
      {configError ? <p className="text-sm text-[var(--danger)]">{configError}</p> : null}
      {profileError ? <p className="text-sm text-[var(--danger)]">{profileError}</p> : null}
      {dayError ? <p className="text-sm text-[var(--danger)]">{dayError}</p> : null}
      {recentDaysError ? <p className="text-sm text-[var(--danger)]">{recentDaysError}</p> : null}

      <WeeklyProgressChart days={recentDays} loading={recentDaysLoading} />

      <FocusBoard
        completedHabits={completedHabits}
        onToggle={handleToggle}
        pendingHabits={pendingHabits}
      />

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
            Por Blocos
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Mapa completo do templo</h2>
        </div>

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
    </section>
  );
}

export default Dashboard;
