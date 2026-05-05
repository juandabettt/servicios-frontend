import { useState } from 'react';
import Icon from './Icon';

const TIPOS_SERVICIO = [
  { value: 'TODOS', label: 'Todos los servicios' },
  { value: 'ENERGIA', label: 'Energía' },
  { value: 'AGUA', label: 'Agua' },
  { value: 'GAS', label: 'Gas' },
  { value: 'INTERNET', label: 'Internet' },
];

const DIAS_OPCIONES = [
  { value: 1, label: '1 día antes' },
  { value: 3, label: '3 días antes' },
  { value: 5, label: '5 días antes' },
  { value: 7, label: '7 días antes' },
];

const INITIAL = {
  nombre: '',
  tipoServicio: 'TODOS',
  diasAntesVencimiento: 3,
  montoMaximo: '',
};

export default function AutoPayRuleModal({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState(INITIAL);

  if (!open) return null;

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nombre: form.nombre.trim(),
      tipoServicio: form.tipoServicio,
      diasAntesVencimiento: Number(form.diasAntesVencimiento),
      montoMaximo: form.montoMaximo ? Number(form.montoMaximo) : null,
    });
    setForm(INITIAL);
  };

  const handleClose = () => {
    setForm(INITIAL);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-surface-container-lowest rounded-3xl p-8 w-full max-w-md shadow-2xl animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-on-surface">Nueva regla de autopago</h3>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant">
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
              Nombre de la regla
            </label>
            <input
              type="text"
              required
              maxLength={100}
              placeholder="Ej: Pagar luz automáticamente"
              value={form.nombre}
              onChange={set('nombre')}
              className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
              Tipo de servicio
            </label>
            <select
              value={form.tipoServicio}
              onChange={set('tipoServicio')}
              className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition appearance-none"
            >
              {TIPOS_SERVICIO.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
              Pagar con anticipación
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DIAS_OPCIONES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, diasAntesVencimiento: d.value }))}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-colors border-2 ${
                    form.diasAntesVencimiento === d.value
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/40'
                  }`}
                >
                  {d.value}d
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
              Monto máximo <span className="font-normal text-on-surface-variant/60">(opcional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Sin límite"
                value={form.montoMaximo}
                onChange={set('montoMaximo')}
                className="w-full pl-8 pr-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 rounded-full border-2 border-outline-variant text-on-surface font-bold hover:bg-surface-container-low transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !form.nombre.trim()}
              className="flex-1 py-3 rounded-full bg-primary text-on-primary font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Icon name="autorenew" className="animate-spin text-sm" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
