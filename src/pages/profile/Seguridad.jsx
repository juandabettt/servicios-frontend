import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';
import { apiClient } from '../../api/client';
import Icon from '../../components/ui/Icon';
import toast from 'react-hot-toast';

export default function Seguridad() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Contraseña actualizada correctamente');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 405) {
        toast('Función disponible próximamente', { icon: '🔜' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    setLogoutAllLoading(true);
    try {
      await apiClient.post('/auth/logout-all');
    } catch {}
    try { await authApi.logout(); } catch {}
    logout();
    navigate('/login');
    toast.success('Sesión cerrada en todos los dispositivos');
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
        <h1 className="text-2xl font-extrabold text-on-surface">Seguridad</h1>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 space-y-5 border border-outline-variant/20">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center">
            <Icon name="lock" className="text-primary" />
          </div>
          <h2 className="text-lg font-bold text-on-surface">Cambiar contraseña</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant">Contraseña actual</label>
            <div className="relative">
              <input
                name="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                value={form.currentPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
              >
                <Icon name={showCurrent ? 'visibility_off' : 'visibility'} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant">Nueva contraseña</label>
            <div className="relative">
              <input
                name="newPassword"
                type={showNew ? 'text' : 'password'}
                value={form.newPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
              >
                <Icon name={showNew ? 'visibility_off' : 'visibility'} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant">Confirmar nueva contraseña</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-on-primary font-bold rounded-full hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />}
            Guardar contraseña
          </button>
        </form>
      </div>

      {/* Cerrar sesión en todos los dispositivos */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-error-container/30 rounded-xl flex items-center justify-center">
            <Icon name="devices_off" className="text-error" />
          </div>
          <div>
            <h2 className="text-base font-bold text-on-surface">Cerrar sesión en todos los dispositivos</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Esto cerrará tu sesión en todos los dispositivos activos.</p>
          </div>
        </div>
        <button
          onClick={handleLogoutAll}
          disabled={logoutAllLoading}
          className="w-full py-3 border-2 border-error/20 text-error font-bold rounded-full hover:bg-error-container/20 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {logoutAllLoading && <div className="w-4 h-4 border-2 border-error/40 border-t-error rounded-full animate-spin" />}
          Cerrar todas las sesiones
        </button>
      </div>
    </div>
  );
}
