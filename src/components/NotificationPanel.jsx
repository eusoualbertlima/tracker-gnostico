import { BellRing, Smartphone } from 'lucide-react';

function NotificationPanel({
  enabled,
  leadMinutes,
  permission,
  supported,
  saving,
  onEnableChange,
  onLeadMinutesChange,
  onRequestPermission,
  onSendTest,
}) {
  const permissionLabel =
    permission === 'granted'
      ? 'Ativadas'
      : permission === 'denied'
        ? 'Bloqueadas'
        : permission === 'default'
          ? 'Não configuradas'
          : 'Não suportadas';

  return (
    <section className="rounded-[28px] border border-white/8 bg-[var(--bg-card)]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-gold)]">
            Notificações
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Lembretes no celular e no navegador</h2>
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/15 p-3 text-[var(--accent-gold)]">
          <BellRing size={20} />
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        <div className="rounded-[22px] border border-white/8 bg-black/15 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Status atual</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {supported
                  ? `${permissionLabel}. Funciona em navegador e PWA instalado com permissão concedida.`
                  : 'Este dispositivo/navegador não expõe a API de notificações.'}
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              {permissionLabel}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <button
            className="action-button justify-center py-3"
            disabled={!supported || permission === 'granted'}
            onClick={onRequestPermission}
            type="button"
          >
            <Smartphone size={18} />
            {permission === 'granted' ? 'Permissão concedida' : 'Ativar notificações'}
          </button>

          <button
            className="ghost-button justify-center py-3"
            disabled={permission !== 'granted'}
            onClick={onSendTest}
            type="button"
          >
            Testar agora
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <label className="rounded-[22px] border border-white/8 bg-black/15 px-4 py-4">
            <span className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-medium text-[var(--text-primary)]">
                  Lembretes automáticos
                </span>
                <span className="mt-1 block text-sm text-[var(--text-muted)]">
                  Dispara avisos locais enquanto o app/PWA estiver ativo.
                </span>
              </span>
              <input
                checked={enabled}
                className="h-5 w-5 accent-[var(--accent-gold)]"
                disabled={permission !== 'granted'}
                onChange={(event) => onEnableChange(event.target.checked)}
                type="checkbox"
              />
            </span>
          </label>

          <label className="rounded-[22px] border border-white/8 bg-black/15 px-4 py-4">
            <span className="block text-sm font-medium text-[var(--text-primary)]">Antecedência</span>
            <select
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none transition focus:border-[var(--accent-gold)]"
              disabled={!enabled || permission !== 'granted'}
              onChange={(event) => onLeadMinutesChange(Number(event.target.value))}
              value={leadMinutes}
            >
              <option value={5}>5 min</option>
              <option value={10}>10 min</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
            </select>
          </label>
        </div>

        <p className="text-sm text-[var(--text-muted)]">
          {saving
            ? 'Salvando preferências...'
            : 'Para push real com o app fechado em segundo plano, o próximo passo é integrar Firebase Cloud Messaging.'}
        </p>
      </div>
    </section>
  );
}

export default NotificationPanel;
