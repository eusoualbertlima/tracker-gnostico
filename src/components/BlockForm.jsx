import { useEffect, useState } from 'react';
import { createId } from '../services/habitService.js';

function BlockForm({ initialValue, onCancel, onSubmit }) {
  const [title, setTitle] = useState(initialValue?.title ?? '');
  const [icon, setIcon] = useState(initialValue?.icon ?? '✨');

  useEffect(() => {
    setTitle(initialValue?.title ?? '');
    setIcon(initialValue?.icon ?? '✨');
  }, [initialValue]);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      id: initialValue?.id ?? createId(title),
      title: title.trim(),
      icon: icon.trim() || '✨',
    });
  }

  return (
    <div className="modal-backdrop">
      <form className="panel glass-panel screen-fade p-6" onSubmit={handleSubmit}>
        <h3 className="text-xl font-bold text-white">
          {initialValue ? 'Editar bloco' : 'Adicionar bloco'}
        </h3>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Título</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-gold)]"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: O Campo de Batalha"
              required
              value={title}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Emoji / ícone</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-gold)]"
              maxLength={4}
              onChange={(event) => setIcon(event.target.value)}
              placeholder="⚡"
              value={icon}
            />
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button className="ghost-button flex-1" onClick={onCancel} type="button">
            Cancelar
          </button>
          <button className="action-button flex-1 justify-center" type="submit">
            Aplicar
          </button>
        </div>
      </form>
    </div>
  );
}

export default BlockForm;
