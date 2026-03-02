import { Menu } from 'lucide-react';

function WorkspacePageHeader({ aside, children, description, eyebrow, onOpenSidebar, title }) {
  return (
    <header className="glass-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--accent-gold)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-white">{title}</h1>
          {description ? (
            <p className="mt-3 max-w-[42rem] text-sm text-[var(--text-muted)]">{description}</p>
          ) : null}
        </div>

        <div className="flex items-start gap-3">
          {aside}
          <button className="ghost-button lg:hidden" onClick={onOpenSidebar} type="button">
            <Menu size={18} />
          </button>
        </div>
      </div>

      {children ? <div className="mt-6">{children}</div> : null}
    </header>
  );
}

export default WorkspacePageHeader;
