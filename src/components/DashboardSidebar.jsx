import {
  BookText,
  ChartColumnBig,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Settings,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    description: 'Visão do dia, ritmo e leitura geral.',
  },
  {
    id: 'habits',
    icon: BookText,
    label: 'Hábitos',
    description: 'Execução, filtros e mapa completo.',
  },
  {
    id: 'reflection',
    icon: ScrollText,
    label: 'Retrospectiva',
    description: 'Escrita do dia e leitura dos egos.',
  },
  {
    id: 'reports',
    icon: ChartColumnBig,
    label: 'Histórico',
    description: 'Relatórios de 30, 60 e 90 dias.',
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Configurações',
    description: 'Perfil, notificações e estrutura.',
  },
];

function SidebarContent({
  activeScreen,
  completedCount,
  onClose,
  onLogout,
  onNavigate,
  pendingCount,
  progress,
  templeName,
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">Templo</p>
          <h2 className="mt-2 text-xl font-bold text-white">{templeName}</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Navegação por contexto, não por rolagem.</p>
        </div>
        {onClose ? (
          <button className="ghost-button lg:hidden" onClick={onClose} type="button">
            <X size={18} />
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3">
        <article className="rounded-[24px] border border-white/8 bg-black/15 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
            Hoje
          </p>
          <p className="mt-3 text-3xl font-extrabold text-[var(--accent-gold)]">{progress}%</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Execução atual do dia.</p>
        </article>

        <div className="grid grid-cols-2 gap-3">
          <article className="rounded-[22px] border border-white/8 bg-black/15 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
              Pendentes
            </p>
            <p className="mt-2 text-xl font-extrabold text-amber-200">{pendingCount}</p>
          </article>
          <article className="rounded-[22px] border border-white/8 bg-black/15 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
              Concluídos
            </p>
            <p className="mt-2 text-xl font-extrabold text-[var(--accent-green)]">{completedCount}</p>
          </article>
        </div>
      </div>

      <nav className="mt-6 space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeScreen;

          return (
            <button
              className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? 'border-[rgba(255,215,0,0.26)] bg-[rgba(255,215,0,0.08)]'
                  : 'border-white/8 bg-black/15 hover:border-white/16 hover:bg-white/5'
              }`}
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose?.();
              }}
              type="button"
            >
              <div
                className={`mt-0.5 rounded-2xl p-2 ${
                  isActive ? 'bg-[rgba(255,215,0,0.12)] text-[var(--accent-gold)]' : 'bg-black/20 text-white'
                }`}
              >
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{item.label}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{item.description}</p>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <button className="ghost-button w-full justify-center py-3" onClick={onLogout} type="button">
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  );
}

function DashboardSidebar({
  activeScreen,
  completedCount,
  isOpen,
  onClose,
  onLogout,
  onNavigate,
  pendingCount,
  progress,
  templeName,
}) {
  return (
    <>
      <aside className="sticky top-6 hidden h-[calc(100vh-48px)] w-[280px] shrink-0 lg:block">
        <div className="glass-panel h-full p-5">
          <SidebarContent
            activeScreen={activeScreen}
            completedCount={completedCount}
            onLogout={onLogout}
            onNavigate={onNavigate}
            pendingCount={pendingCount}
            progress={progress}
            templeName={templeName}
          />
        </div>
      </aside>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            type="button"
          />
          <aside className="absolute inset-y-0 left-0 w-[82%] max-w-[320px] p-4">
            <div className="glass-panel h-full p-5">
              <SidebarContent
                activeScreen={activeScreen}
                completedCount={completedCount}
                onClose={onClose}
                onLogout={onLogout}
                onNavigate={onNavigate}
                pendingCount={pendingCount}
                progress={progress}
                templeName={templeName}
              />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

export default DashboardSidebar;
