import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useHabitConfig } from '../hooks/useHabitConfig.js';
import { useUserProfile } from '../hooks/useUserProfile.js';
import {
  addBlock,
  addHabit,
  deleteBlock,
  deleteHabit,
  updateBlock,
  updateHabit,
  updateNotificationPreferences,
  updateUserProfile,
} from '../services/habitService.js';
import {
  getNotificationPermission,
  notificationsSupported,
  requestNotificationPermission,
  showTempleNotification,
} from '../services/notificationService.js';
import BlockForm from './BlockForm.jsx';
import HabitForm from './HabitForm.jsx';
import MetricTile from './MetricTile.jsx';
import NotificationPanel from './NotificationPanel.jsx';
import ProfileForm from './ProfileForm.jsx';
import WorkspacePageHeader from './WorkspacePageHeader.jsx';

function SettingsScreen({ onOpenSidebar }) {
  const { user } = useAuth();
  const { config, loading, error } = useHabitConfig(user?.uid);
  const { profile, loading: profileLoading, error: profileError } = useUserProfile(user?.uid);
  const [blockDraft, setBlockDraft] = useState(null);
  const [habitDraft, setHabitDraft] = useState(null);
  const [profileDraft, setProfileDraft] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission());
  const [notificationSaving, setNotificationSaving] = useState(false);
  const [notificationError, setNotificationError] = useState('');

  const blocks = config?.blocks ?? [];
  const totalHabits = blocks.reduce((sum, block) => sum + (block.habits?.length ?? 0), 0);
  const notificationSettings = profile?.notifications ?? { enabled: false, leadMinutes: 10 };

  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  async function handleDeleteBlock(blockId) {
    if (window.confirm('Tem certeza que deseja remover este bloco?')) {
      await deleteBlock(user.uid, blockId);
    }
  }

  async function handleDeleteHabit(blockId, habitId) {
    if (window.confirm('Tem certeza que deseja remover este hábito?')) {
      await deleteHabit(user.uid, blockId, habitId);
    }
  }

  async function handleSubmitBlock(data) {
    if (blockDraft?.id) {
      await updateBlock(user.uid, blockDraft.id, data);
    } else {
      await addBlock(user.uid, data);
    }

    setBlockDraft(null);
  }

  async function handleSubmitHabit(data) {
    if (habitDraft?.habit?.id) {
      await updateHabit(user.uid, habitDraft.blockId, habitDraft.habit.id, data);
    } else {
      await addHabit(user.uid, habitDraft.blockId, data);
    }

    setHabitDraft(null);
  }

  async function handleSubmitProfile(data) {
    await updateUserProfile(user.uid, data);
    setProfileDraft(null);
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
    } catch (submitError) {
      setNotificationError(submitError.message || 'Falha ao salvar notificações.');
    } finally {
      setNotificationSaving(false);
    }
  }

  return (
    <section className="screen-fade space-y-6">
      <WorkspacePageHeader
        description="Ajuste o perfil, defina como os lembretes funcionam e mantenha a estrutura dos blocos bem organizada."
        eyebrow="Configurações"
        onOpenSidebar={onOpenSidebar}
        title="Perfil, sistema e arquitetura"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile
            label="Templo"
            note="Nome público do seu ambiente."
            value={profile?.templeName?.trim() || 'Templo Digital'}
          />
          <MetricTile
            label="Blocos"
            note="Estruturas ativas no seu mapa."
            tone="slate"
            value={blocks.length}
          />
          <MetricTile
            label="Hábitos"
            note="Total configurado atualmente."
            tone="green"
            value={totalHabits}
          />
          <MetricTile
            label="Lembretes"
            note={notificationSettings.enabled ? 'Ativos neste perfil.' : 'Desligados neste perfil.'}
            tone="amber"
            value={notificationSettings.enabled ? 'Ligados' : 'Desligados'}
          />
        </div>
      </WorkspacePageHeader>

      {loading ? <p className="text-sm text-[var(--text-muted)]">Carregando configuração...</p> : null}
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      {profileLoading ? <p className="text-sm text-[var(--text-muted)]">Carregando perfil...</p> : null}
      {profileError ? <p className="text-sm text-[var(--danger)]">{profileError}</p> : null}
      {notificationError ? <p className="text-sm text-[var(--danger)]">{notificationError}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="glass-panel p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Perfil</p>
              <h2 className="mt-1 text-lg font-bold text-white">
                {profile?.templeName?.trim() || 'Templo Digital'}
              </h2>
              <p className="mt-2 text-sm text-[var(--text-primary)]">
                {profile?.displayName?.trim() || user?.displayName || 'Buscador'}
              </p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {profile?.mantra?.trim() || 'Disciplina, presença e serviço.'}
              </p>
            </div>
            <button
              className="action-button shrink-0"
              onClick={() =>
                setProfileDraft({
                  displayName: profile?.displayName || user?.displayName || '',
                  templeName: profile?.templeName || '',
                  mantra: profile?.mantra || '',
                })
              }
              type="button"
            >
              <Pencil size={16} />
              Editar perfil
            </button>
          </div>
        </section>

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

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
            Estrutura
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Blocos e hábitos do templo</h2>
        </div>

        {blocks.map((block) => (
          <section className="glass-panel p-5" key={block.id}>
            <div className="flex items-start justify-between gap-3">
              <button className="text-left" onClick={() => setBlockDraft(block)} type="button">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Bloco</p>
                <h2 className="mt-1 text-lg font-bold text-white">
                  {block.icon} {block.title}
                </h2>
              </button>
              <div className="flex gap-2">
                <button className="ghost-button" onClick={() => setBlockDraft(block)} type="button">
                  <Pencil size={16} />
                </button>
                <button
                  className="ghost-button danger-button"
                  onClick={() => handleDeleteBlock(block.id)}
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {(block.habits ?? []).map((habit) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-black/15 px-4 py-3"
                  key={habit.id}
                >
                  <button
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setHabitDraft({ blockId: block.id, habit })}
                    type="button"
                  >
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">{habit.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                      {habit.time}
                    </p>
                  </button>
                  <div className="flex gap-2">
                    <button
                      className="ghost-button"
                      onClick={() => setHabitDraft({ blockId: block.id, habit })}
                      type="button"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="ghost-button danger-button"
                      onClick={() => handleDeleteHabit(block.id, habit.id)}
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="action-button mt-4 w-full justify-center"
              onClick={() => setHabitDraft({ blockId: block.id, habit: null })}
              type="button"
            >
              <Plus size={18} />
              Adicionar hábito
            </button>
          </section>
        ))}
      </section>

      <button className="action-button w-full justify-center py-3" onClick={() => setBlockDraft({})} type="button">
        <Plus size={18} />
        Adicionar bloco
      </button>

      {blockDraft !== null ? (
        <BlockForm
          initialValue={blockDraft.id ? blockDraft : null}
          onCancel={() => setBlockDraft(null)}
          onSubmit={handleSubmitBlock}
        />
      ) : null}

      {habitDraft !== null ? (
        <HabitForm
          initialValue={habitDraft.habit}
          onCancel={() => setHabitDraft(null)}
          onSubmit={handleSubmitHabit}
        />
      ) : null}

      {profileDraft !== null ? (
        <ProfileForm
          initialValue={profileDraft}
          onCancel={() => setProfileDraft(null)}
          onSubmit={handleSubmitProfile}
        />
      ) : null}
    </section>
  );
}

export default SettingsScreen;
