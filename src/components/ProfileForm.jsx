import { useEffect, useState } from 'react';

function ProfileForm({ initialValue, onCancel, onSubmit }) {
  const [displayName, setDisplayName] = useState(initialValue?.displayName ?? '');
  const [templeName, setTempleName] = useState(initialValue?.templeName ?? '');
  const [mantra, setMantra] = useState(initialValue?.mantra ?? '');

  useEffect(() => {
    setDisplayName(initialValue?.displayName ?? '');
    setTempleName(initialValue?.templeName ?? '');
    setMantra(initialValue?.mantra ?? '');
  }, [initialValue]);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      displayName,
      templeName,
      mantra,
    });
  }

  return (
    <div className="modal-backdrop">
      <form className="panel glass-panel screen-fade p-6" onSubmit={handleSubmit}>
        <h3 className="text-xl font-bold text-white">Perfil do templo</h3>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              Nome exibido
            </span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-gold)]"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Ex.: Albert"
              value={displayName}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              Nome do templo
            </span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-gold)]"
              onChange={(event) => setTempleName(event.target.value)}
              placeholder="Ex.: Templo de Albert"
              value={templeName}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Mantra</span>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-gold)]"
              onChange={(event) => setMantra(event.target.value)}
              placeholder="Ex.: Disciplina, presença e serviço."
              value={mantra}
            />
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button className="ghost-button flex-1" onClick={onCancel} type="button">
            Cancelar
          </button>
          <button className="action-button flex-1 justify-center" type="submit">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfileForm;
