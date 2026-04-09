import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';

const NAV_ITEMS = [
  { path: '/dashboard', icon: 'home', label: 'Inicio' },
  { path: '/invoices', icon: 'description', label: 'Facturas' },
  { path: '/payments', icon: 'payments', label: 'Pagar' },
  { path: '/ai', icon: 'psychology', label: 'IA' },
  { path: '/profile', icon: 'person', label: 'Perfil' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 bg-surface/90 backdrop-blur-2xl dark:bg-gray-950/90 border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_24px_rgba(0,0,0,0.05)] z-50 rounded-t-3xl">
      {NAV_ITEMS.map(({ path, icon, label }) => {
        const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
              isActive
                ? 'bg-teal-800 text-white dark:bg-teal-500 dark:text-gray-950 scale-90'
                : 'text-gray-500 dark:text-gray-400 scale-90'
            }`}
          >
            <Icon name={icon} filled={isActive} />
            <span className="text-[10px] font-medium font-plus-jakarta mt-1">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
