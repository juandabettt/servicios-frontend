import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { apiClient } from '../../api/client';
import Icon from '../../components/ui/Icon';
import toast from 'react-hot-toast';

export default function DatosPersonales() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [form, setForm] = useState({
    nombre: user?.nombre || user?.name || '',
    telefono: user?.telefono || '',
    ciudad: user?.ciudad || '',
    documento: user?.documento || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefono' && !/^\d{0,10}$/.test(value)) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.put('/users/profile', form);
      toast.success('Datos actualizados correctamente');
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 405) {
        toast('Función disponible próximamente', { icon: '🔜' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pt-8 pb-8 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
        >
          <Icon name="arrow_back" className="text-on-surface" />
        </button>
        <h1 className="text-2xl font-extrabold text-on-surface">Datos personales</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-3xl p-6 space-y-5 border border-outline-variant/20">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface-variant">Nombre completo</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Tu nombre completo"
            className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface-variant">Correo electrónico</label>
          <input
            value={user?.email || ''}
            readOnly
            className="w-full px-4 py-3 rounded-2xl bg-surface-container border border-outline-variant/20 text-on-surface-variant cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface-variant">Teléfono</label>
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="3001234567"
            inputMode="numeric"
            maxLength={10}
            className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface-variant">Ciudad</label>
          <input
            name="ciudad"
            value={form.ciudad}
            onChange={handleChange}
            placeholder="Tu ciudad"
            className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface-variant">Documento de identidad</label>
          <input
            name="documento"
            value={form.documento}
            onChange={handleChange}
            placeholder="Número de documento"
            className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary text-on-primary font-bold rounded-full hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <div className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />}
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
