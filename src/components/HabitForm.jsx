import { useEffect, useState } from 'react';
import { createId } from '../services/habitService.js';

function HabitForm({ initialValue, onCancel, onSubmit }) {
  const [label, setLabel] = useState(initialValue?.label ?? '');
  const [time, setTime] = useState(initialValue?.time ?? '');

  useEffect(() => {
    setLabel(initialValue?.label ?? '');
    setTime(initialValue?.time ?? '');
  }, [initialValue]);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      id: initialValue?.id ?? createId(label),
      label: label.trim(),
      time: time.trim() || 'Dia todo',
    });
  }

  return (
    <div className="modal-backdrop">
      <form className="panel glass-panel screen-fade p-6" onSubmit={handleSubmit}>
        <h3 className="text-xl font-bold text-white">
          {initialValue ? 'Editar hábito' : 'Adicionar hábito'}
        </h3>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Label</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-gold)]"
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Ex.: Leitura / Oração / Meditação"
              required
              value={label}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Horário</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-gold)]"
              onChange={(event) => setTime(event.target.value)}
              placeholder="04:00 ou Dia todo"
              value={time}
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

export default HabitForm;
