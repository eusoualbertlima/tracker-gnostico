import {
  BellRing,
  BookText,
  ChartColumnBig,
  Filter,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Settings,
  X,
} from 'lucide-react';

const SECTION_ITEMS = [
  { id: 'overview', icon: LayoutDashboard, label: 'Visão Geral' },
  { id: 'insights', icon: ChartColumnBig, label: 'Gráficos' },
  { id: 'filters', icon: Filter, label: 'Filtros' },
  { id: 'notifications', icon: BellRing, label: 'Notificações' },
  { id: 'reflection', icon: ScrollText, label: 'Retrospectiva' },
  { id: 'blocks', icon: BookText, label: 'Blocos' },
];

function SidebarContent({ onClose, onLogout, onOpenSettings, onScrollToSection }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
            Navegação
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Templo Digital</h2>
        </div>
        {onClose ? (
          <button className="ghost-button lg:hidden" onClick={onClose} type="button">
            <X size={18} />
          </button>
        ) : null}
      </div>

      <nav className="mt-6 space-y-2">
        {SECTION_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-black/15 px-4 py-3 text-left text-sm font-medium text-[var(--text-primary)] transition hover:border-white/16 hover:bg-white/5"
              key={item.id}
              onClick={() => {
                onScrollToSection(item.id);
                onClose?.();
              }}
              type="button"
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 pt-6">
        <button className="action-button w-full justify-center py-3" onClick={onOpenSettings} type="button">
          <Settings size={18} />
          Configurações
        </button>
        <button className="ghost-button w-full justify-center py-3" onClick={onLogout} type="button">
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  );
}

function DashboardSidebar({ isOpen, onClose, onLogout, onOpenSettings, onScrollToSection }) {
  return (
    <>
      <aside className="sticky top-6 hidden h-[calc(100vh-48px)] w-[280px] shrink-0 lg:block">
        <div className="glass-panel h-full p-5">
          <SidebarContent
            onLogout={onLogout}
            onOpenSettings={onOpenSettings}
            onScrollToSection={onScrollToSection}
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
                onClose={onClose}
                onLogout={onLogout}
                onOpenSettings={onOpenSettings}
                onScrollToSection={onScrollToSection}
              />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

export default DashboardSidebar;
