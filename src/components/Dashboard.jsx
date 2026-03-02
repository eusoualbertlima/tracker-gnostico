import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Menu } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useHabitConfig } from '../hooks/useHabitConfig.js';
import { useHabits } from '../hooks/useHabits.js';
import { useRecentProgress } from '../hooks/useRecentProgress.js';
import { useUserProfile } from '../hooks/useUserProfile.js';
import { saveReflection, toggleHabit, updateNotificationPreferences } from '../services/habitService.js';
import {
  buildReminderStorageKey,
  getNotificationPermission,
  notificationsSupported,
  requestNotificationPermission,
  showTempleNotification,
} from '../services/notificationService.js';
import { analyzeRetrospective } from '../utils/egoAnalysis.js';
import DashboardSidebar from './DashboardSidebar.jsx';
import FocusBoard from './FocusBoard.jsx';
import HabitFilters from './HabitFilters.jsx';
import HabitHistoryPanel from './HabitHistoryPanel.jsx';
import HabitBlock from './HabitBlock.jsx';
import MonthlyHeatmap from './MonthlyHeatmap.jsx';
import NotificationPanel from './NotificationPanel.jsx';
import ProgressBar from './ProgressBar.jsx';
import RetrospectivePanel from './RetrospectivePanel.jsx';
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

function getTimeBucket(time) {
  const rank = getTimeRank(time);

  if (rank === Number.MAX_SAFE_INTEGER) {
    return 'timeless';
  }

  if (rank < 12 * 60) {
    return 'morning';
  }

  if (rank < 18 * 60) {
    return 'afternoon';
  }

  return 'night';
}

function Dashboard({ onOpenSettings }) {
  const { user, logout } = useAuth();
  const { config, loading: configLoading, error: configError } = useHabitConfig(user?.uid);
  const { profile, loading: profileLoading, error: profileError } = useUserProfile(user?.uid);
  const { days: recentDays, loading: recentDaysLoading, error: recentDaysError } = useRecentProgress(
    user?.uid,
    35,
  );
  const blocks = useMemo(() => config?.blocks ?? [], [config]);
  const { day, streak, loading: dayLoading, error: dayError, totalHabits, dateKey } = useHabits(
    user?.uid,
    blocks,
  );
  const [statusFilter, setStatusFilter] = useState('all');
  const [blockFilter, setBlockFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [selectedHabitId, setSelectedHabitId] = useState('');
  const [reflectionSaving, setReflectionSaving] = useState(false);
  const [reflectionError, setReflectionError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission());
  const [notificationSaving, setNotificationSaving] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);
  const notificationSettings = profile?.notifications ?? { enabled: false, leadMinutes: 10 };

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
  const filteredHabits = useMemo(() => {
    const normalizedSearch = deferredSearchValue.trim().toLowerCase();

    return organizedHabits.filter((habit) => {
      if (statusFilter === 'pending' && habit.checked) {
        return false;
      }

      if (statusFilter === 'completed' && !habit.checked) {
        return false;
      }

      if (blockFilter !== 'all' && habit.blockId !== blockFilter) {
        return false;
      }

      if (timeFilter !== 'all' && getTimeBucket(habit.time) !== timeFilter) {
        return false;
      }

      if (normalizedSearch && !habit.label.toLowerCase().includes(normalizedSearch)) {
        return false;
      }

      return true;
    });
  }, [blockFilter, deferredSearchValue, organizedHabits, statusFilter, timeFilter]);
  const pendingHabits = useMemo(
    () => filteredHabits.filter((habit) => !habit.checked),
    [filteredHabits],
  );
  const completedHabits = useMemo(
    () => filteredHabits.filter((habit) => habit.checked),
    [filteredHabits],
  );
  const habitsForHistory = filteredHabits.length ? filteredHabits : organizedHabits;
  const filteredHabitIds = useMemo(
    () => new Set(filteredHabits.map((habit) => habit.id)),
    [filteredHabits],
  );
  const filteredBlocks = useMemo(
    () =>
      blocks
        .map((block) => ({
          ...block,
          habits: (block.habits ?? []).filter((habit) =>
            filteredHabits.length ? filteredHabitIds.has(habit.id) : true,
          ),
        }))
        .filter((block) => block.habits.length),
    [blocks, filteredHabitIds, filteredHabits.length],
  );
  const egoAnalysis = day?.egoAnalysis ?? analyzeRetrospective(day?.reflection ?? '');

  useEffect(() => {
    if (!habitsForHistory.length) {
      setSelectedHabitId('');
      return;
    }

    if (!habitsForHistory.some((habit) => habit.id === selectedHabitId)) {
      setSelectedHabitId(habitsForHistory[0].id);
    }
  }, [habitsForHistory, selectedHabitId]);

  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  useEffect(() => {
    if (!notificationSettings.enabled || notificationPermission !== 'granted') {
      return undefined;
    }

    const timedPendingHabits = organizedHabits.filter(
      (habit) => !habit.checked && getTimeRank(habit.time) !== Number.MAX_SAFE_INTEGER,
    );

    async function checkReminders() {
      const now = new Date();
      const minutesNow = now.getHours() * 60 + now.getMinutes();

      for (const habit of timedPendingHabits) {
        const habitMinutes = getTimeRank(habit.time);
        const reminderMinute = habitMinutes - notificationSettings.leadMinutes;
        const alreadySentKey = buildReminderStorageKey(
          dateKey,
          habit.id,
          notificationSettings.leadMinutes,
        );

        if (minutesNow < reminderMinute || minutesNow > habitMinutes) {
          continue;
        }

        if (window.localStorage.getItem(alreadySentKey)) {
          continue;
        }

        const sent = await showTempleNotification(`Habitual: ${habit.label}`, {
          body: `${habit.blockTitle} com início em ${habit.time}.`,
          tag: alreadySentKey,
        });

        if (sent) {
          window.localStorage.setItem(alreadySentKey, new Date().toISOString());
        }
      }
    }

    checkReminders().catch(() => {
      console.error('Falha ao verificar lembretes locais.');
    });

    const intervalId = window.setInterval(() => {
      checkReminders().catch(() => {
        console.error('Falha ao verificar lembretes locais.');
      });
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [dateKey, notificationPermission, notificationSettings.enabled, notificationSettings.leadMinutes, organizedHabits]);

  function scrollToSection(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleToggle(habitId) {
    await toggleHabit(user.uid, dateKey, habitId);
  }

  async function handleReflectionSave(nextText) {
    try {
      setReflectionSaving(true);
      setReflectionError('');
      await saveReflection(user.uid, dateKey, nextText);
    } catch (error) {
      setReflectionError(error.message || 'Falha ao salvar retrospectiva.');
    } finally {
      setReflectionSaving(false);
    }
  }

  async function handleRequestNotificationPermission() {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
  }

  async function handleSendTestNotification() {
    await showTempleNotification('Templo Digital', {
      body: 'As notificações estão ativas neste dispositivo.',
      tag: 'templo-test',
    });
  }

  async function handleNotificationSettingsChange(nextSettings) {
    try {
      setNotificationSaving(true);
      setNotificationError('');
      await updateNotificationPreferences(user.uid, nextSettings);
    } catch (error) {
      setNotificationError(error.message || 'Falha ao salvar notificações.');
    } finally {
      setNotificationSaving(false);
    }
  }

  return (
    <section className="screen-fade">
      <div className="mx-auto flex w-full max-w-[1320px] gap-6">
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={logout}
          onOpenSettings={onOpenSettings}
          onScrollToSection={scrollToSection}
        />

        <div className="min-w-0 flex-1 space-y-6">
          <header className="glass-panel p-6" id="overview">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--accent-gold)]">
                  Paz Inverencial, {getGreetingName(user, profile)}.
                </p>
                <h1 className="mt-3 text-3xl font-extrabold text-white">{templeName}</h1>
                <p className="mt-2 text-sm capitalize text-[var(--text-muted)]">{formattedDate}</p>
                <p className="mt-3 max-w-[32rem] text-sm text-[var(--text-muted)]">{mantra}</p>
              </div>
              <button className="ghost-button lg:hidden" onClick={() => setSidebarOpen(true)} type="button">
                <Menu size={18} />
              </button>
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
          {reflectionError ? <p className="text-sm text-[var(--danger)]">{reflectionError}</p> : null}
          {notificationError ? <p className="text-sm text-[var(--danger)]">{notificationError}</p> : null}

          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]" id="insights">
            <WeeklyProgressChart days={recentDays} loading={recentDaysLoading} />
            <MonthlyHeatmap days={recentDays} />
          </div>

          <div id="filters">
            <HabitFilters
              blockFilter={blockFilter}
              blocks={blocks}
              onBlockFilterChange={setBlockFilter}
              onSearchChange={setSearchValue}
              onStatusFilterChange={setStatusFilter}
              onTimeFilterChange={setTimeFilter}
              searchValue={searchValue}
              statusFilter={statusFilter}
              timeFilter={timeFilter}
            />
          </div>

          <FocusBoard
            completedHabits={completedHabits}
            onToggle={handleToggle}
            pendingHabits={pendingHabits}
          />

          <HabitHistoryPanel
            days={recentDays}
            habitId={selectedHabitId}
            habits={habitsForHistory}
            onHabitChange={setSelectedHabitId}
          />

          <div id="notifications">
            <NotificationPanel
              enabled={notificationSettings.enabled}
              leadMinutes={notificationSettings.leadMinutes}
              onEnableChange={(enabled) =>
                handleNotificationSettingsChange({
                  ...notificationSettings,
                  enabled,
                })
              }
              onLeadMinutesChange={(leadMinutes) =>
                handleNotificationSettingsChange({
                  ...notificationSettings,
                  leadMinutes,
                })
              }
              onRequestPermission={handleRequestNotificationPermission}
              onSendTest={handleSendTestNotification}
              permission={notificationPermission}
              saving={notificationSaving}
              supported={notificationsSupported()}
            />
          </div>

          <div id="reflection">
            <RetrospectivePanel
              analysis={egoAnalysis}
              initialText={day?.reflection ?? ''}
              onSave={handleReflectionSave}
              saving={reflectionSaving}
            />
          </div>

          <section className="space-y-4" id="blocks">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
                Por Blocos
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">Mapa completo do templo</h2>
            </div>

            {filteredBlocks.length ? (
              <div className="grid gap-6 2xl:grid-cols-2">
                {filteredBlocks.map((block) => (
                  <HabitBlock
                    block={block}
                    habitsState={day?.habits}
                    key={block.id}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-[24px] border border-white/8 bg-black/15 px-4 py-4 text-sm text-[var(--text-muted)]">
                Nenhum hábito encontrado com os filtros atuais.
              </p>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
