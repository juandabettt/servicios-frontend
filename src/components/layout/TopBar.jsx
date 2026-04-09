import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import Avatar from '../ui/Avatar';
import Icon from '../ui/Icon';

export default function TopBar() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <header className="w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-xl dark:bg-gray-900/80 shadow-sm flex justify-between items-center px-6 py-3">
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden md:flex items-center bg-gray-200/20 dark:bg-gray-800/20 rounded-full px-4 py-1.5 w-full max-w-md">
          <Icon name="search" className="text-gray-400 text-lg" />
          <input
            className="bg-transparent border-none focus:ring-0 text-sm font-plus-jakarta w-full ml-2 outline-none"
            placeholder="Buscar facturas o pagos..."
            type="text"
          />
        </div>
        <span className="md:hidden text-xl font-bold text-teal-900 dark:text-teal-100 brand-font">ServiciosYa</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/notifications')}
          className="p-2 text-teal-900 dark:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-full relative"
        >
          <Icon name="notifications" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full" />
        </button>
        <button className="p-2 text-teal-900 dark:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-full">
          <Icon name="help" />
        </button>
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200/50 dark:border-gray-800/50">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-on-surface">{user?.nombre || user?.name || 'Usuario'}</p>
            <p className="text-[10px] text-on-surface-variant">{user?.ciudad || ''}</p>
          </div>
          <Avatar name={user?.nombre || user?.name || ''} size={10} />
        </div>
      </div>
    </header>
  );
}
