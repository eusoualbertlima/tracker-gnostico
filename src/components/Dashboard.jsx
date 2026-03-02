import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useHabitConfig } from '../hooks/useHabitConfig.js';
import { useHabits } from '../hooks/useHabits.js';
import { useRecentProgress } from '../hooks/useRecentProgress.js';
import { useUserProfile } from '../hooks/useUserProfile.js';
import { saveReflection, toggleHabit } from '../services/habitService.js';
import {
  buildReminderStorageKey,
  getNotificationPermission,
  showTempleNotification,
} from '../services/notificationService.js';
import { analyzeRetrospective } from '../utils/egoAnalysis.js';
import DashboardHomePage from './DashboardHomePage.jsx';
import DashboardSidebar from './DashboardSidebar.jsx';
import HabitsPage from './HabitsPage.jsx';
import ReflectionPage from './ReflectionPage.jsx';
import ReportsPage from './ReportsPage.jsx';
import SettingsScreen from './SettingsScreen.jsx';

const WORKSPACE_SCREENS = new Set(['dashboard', 'habits', 'reflection', 'reports', 'settings']);
const ACTIVE_SCREEN_STORAGE_KEY = 'temple-active-screen';

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

function getInitialScreen() {
  if (typeof window === 'undefined') {
    return 'dashboard';
  }

  const storedScreen = window.localStorage.getItem(ACTIVE_SCREEN_STORAGE_KEY);
  return WORKSPACE_SCREENS.has(storedScreen) ? storedScreen : 'dashboard';
}

function Dashboard() {
  const { user, logout } = useAuth();
  const { config, loading: configLoading, error: configError } = useHabitConfig(user?.uid);
  const { profile, loading: profileLoading, error: profileError } = useUserProfile(user?.uid);
  const { days: recentDays, loading: recentDaysLoading, error: recentDaysError } = useRecentProgress(
    user?.uid,
    90,
  );
  const blocks = useMemo(() => config?.blocks ?? [], [config]);
  const { day, streak, loading: dayLoading, error: dayError, totalHabits, dateKey } = useHabits(
    user?.uid,
    blocks,
  );
  const [activeScreen, setActiveScreen] = useState(getInitialScreen);
  const [statusFilter, setStatusFilter] = useState('all');
  const [blockFilter, setBlockFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [selectedHabitId, setSelectedHabitId] = useState('');
  const [reflectionSaving, setReflectionSaving] = useState(false);
  const [reflectionError, setReflectionError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission());
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
  const greetingName = getGreetingName(user, profile);

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
        .sort((firstHabit, secondHabit) => {
          const timeDiff = getTimeRank(firstHabit.time) - getTimeRank(secondHabit.time);

          if (timeDiff !== 0) {
            return timeDiff;
          }

          return firstHabit.blockOrder - secondHabit.blockOrder;
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
  const dayHasReflection = Boolean(day?.reflection?.trim());

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
    window.localStorage.setItem(ACTIVE_SCREEN_STORAGE_KEY, activeScreen);
  }, [activeScreen]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [activeScreen]);

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

  function renderActiveScreen() {
    if (activeScreen === 'habits') {
      return (
        <HabitsPage
          blockFilter={blockFilter}
          blocks={blocks}
          completedHabits={completedHabits}
          days={recentDays}
          filteredBlocks={filteredBlocks}
          filteredHabits={filteredHabits}
          habitsState={day?.habits}
          onBlockFilterChange={setBlockFilter}
          onHabitChange={setSelectedHabitId}
          onOpenSidebar={() => setSidebarOpen(true)}
          onSearchChange={setSearchValue}
          onStatusFilterChange={setStatusFilter}
          onTimeFilterChange={setTimeFilter}
          onToggle={handleToggle}
          pendingHabits={pendingHabits}
          selectedHabitId={selectedHabitId}
        />
      );
    }

    if (activeScreen === 'reflection') {
      return (
        <ReflectionPage
          analysis={egoAnalysis}
          dayHasReflection={dayHasReflection}
          initialText={day?.reflection ?? ''}
          onOpenSidebar={() => setSidebarOpen(true)}
          onSave={handleReflectionSave}
          recentDays={recentDays}
          saving={reflectionSaving}
        />
      );
    }

    if (activeScreen === 'settings') {
      return <SettingsScreen onOpenSidebar={() => setSidebarOpen(true)} />;
    }

    if (activeScreen === 'reports') {
      return (
        <ReportsPage
          blocks={blocks}
          days={recentDays}
          loading={recentDaysLoading}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      );
    }

    return (
      <DashboardHomePage
        checkedCount={checkedCount}
        completedCount={completedHabits.length}
        dayHasReflection={dayHasReflection}
        formattedDate={formattedDate}
        greetingName={greetingName}
        mantra={mantra}
        onOpenSidebar={() => setSidebarOpen(true)}
        pendingCount={pendingHabits.length}
        progress={progress}
        recentDays={recentDays}
        recentDaysLoading={recentDaysLoading}
        streak={streak}
        templeName={templeName}
        totalHabits={totalHabits}
      />
    );
  }

  return (
    <section className="screen-fade">
      <div className="mx-auto flex w-full max-w-[1320px] gap-6">
        <DashboardSidebar
          activeScreen={activeScreen}
          completedCount={completedHabits.length}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={logout}
          onNavigate={setActiveScreen}
          pendingCount={pendingHabits.length}
          progress={progress}
          templeName={templeName}
        />

        <div className="min-w-0 flex-1 space-y-6">
          {configLoading || dayLoading || profileLoading ? (
            <p className="text-sm text-[var(--text-muted)]">Sincronizando hábitos do dia...</p>
          ) : null}
          {configError ? <p className="text-sm text-[var(--danger)]">{configError}</p> : null}
          {profileError ? <p className="text-sm text-[var(--danger)]">{profileError}</p> : null}
          {dayError ? <p className="text-sm text-[var(--danger)]">{dayError}</p> : null}
          {recentDaysError ? <p className="text-sm text-[var(--danger)]">{recentDaysError}</p> : null}
          {reflectionError ? <p className="text-sm text-[var(--danger)]">{reflectionError}</p> : null}

          {renderActiveScreen()}
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
