import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import Icon from '../ui/Icon';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api';

const NAV_ITEMS = [
  { path: '/dashboard', icon: 'home', label: 'Inicio' },
  { path: '/invoices', icon: 'description', label: 'Facturas' },
  { path: '/payments', icon: 'payments', label: 'Pagar' },
  { path: '/ai', icon: 'psychology', label: 'Análisis IA' },
  { path: '/profile', icon: 'person', label: 'Perfil' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    logout();
    navigate('/login');
    toast.success('Sesión cerrada');
  };

  return (
    <aside className="hidden md:flex flex-col h-screen w-[240px] z-50 fixed left-0 top-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200/50 dark:border-gray-800/50 p-4">
      <div className="flex flex-col h-full">
        <div className="mb-10 px-2">
          <span className="text-2xl font-black text-teal-900 dark:text-teal-100 brand-font">ServiciosYa</span>
          <p className="text-[10px] text-teal-800 dark:text-teal-300 font-medium tracking-widest uppercase mt-1">
            Digital Concierge
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map(({ path, icon, label }) => {
            const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                  isActive
                    ? 'text-teal-900 dark:text-teal-100 font-bold bg-teal-50 dark:bg-teal-900/30 translate-x-1'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <Icon name={icon} filled={isActive} />
                <span className="font-plus-jakarta">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 space-y-2 border-t border-gray-200/50 dark:border-gray-800/50">
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all rounded-lg text-sm"
          >
            <Icon name="settings" />
            <span className="font-plus-jakarta">Ajustes</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all rounded-lg text-sm"
          >
            <Icon name="logout" />
            <span className="font-plus-jakarta">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
