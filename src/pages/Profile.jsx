import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import Avatar from '../components/ui/Avatar';
import Icon from '../components/ui/Icon';
import toast from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
    navigate('/login');
    toast.success('Sesión cerrada');
  };

  const menuItems = [
    { icon: 'person', label: 'Datos personales', action: () => {} },
    { icon: 'home', label: 'Mis propiedades', action: () => {} },
    { icon: 'credit_card', label: 'Métodos de pago', action: () => {} },
    { icon: 'autorenew', label: 'Autopago', action: () => navigate('/autopay') },
    { icon: 'notifications', label: 'Notificaciones', action: () => navigate('/notifications') },
    { icon: 'security', label: 'Seguridad', action: () => {} },
    { icon: 'help', label: 'Ayuda y soporte', action: () => {} },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 pt-8 pb-8 space-y-8">
      {/* User card */}
      <div className="bg-gradient-to-br from-primary to-primary-container rounded-[2rem] p-8 text-white flex items-center gap-6">
        <Avatar name={user?.nombre || user?.name || 'U'} size={16} />
        <div>
          <h1 className="text-2xl font-black">{user?.nombre || user?.name || 'Usuario'}</h1>
          <p className="text-primary-fixed/80">{user?.email || ''}</p>
          {user?.ciudad && <p className="text-primary-fixed/70 text-sm mt-1">{user.ciudad}</p>}
        </div>
      </div>

      {/* Menu */}
      <div className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/20">
        {menuItems.map(({ icon, label, action }, i) => (
          <button
            key={label}
            onClick={action}
            className={`w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-surface-container-low transition-colors ${
              i < menuItems.length - 1 ? 'border-b border-outline-variant/10' : ''
            }`}
          >
            <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center">
              <Icon name={icon} className="text-on-surface-variant" />
            </div>
            <span className="flex-1 font-medium text-on-surface">{label}</span>
            <Icon name="chevron_right" className="text-outline" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-4 border-2 border-error/20 text-error font-bold rounded-full hover:bg-error-container/20 transition-colors flex items-center justify-center gap-2"
      >
        <Icon name="logout" />
        Cerrar sesión
      </button>

      <p className="text-center text-xs text-on-surface-variant">ServiciosYa v0.1.0</p>
    </div>
  );
}
