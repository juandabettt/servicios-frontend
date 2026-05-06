import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../api/notifications.api';
import Icon from '../components/ui/Icon';
import { formatDateShort } from '../utils/dates';

const NOTIFICATION_ICONS = {
  FACTURA_AGREGADA: { icon: 'receipt', color: 'text-tertiary', bg: 'bg-tertiary-fixed/20' },
  FACTURA_VENCE_7_DIAS: { icon: 'schedule', color: 'text-secondary', bg: 'bg-secondary-fixed' },
  FACTURA_VENCE_3_DIAS: { icon: 'schedule', color: 'text-error', bg: 'bg-error-container' },
  FACTURA_VENCE_HOY: { icon: 'warning', color: 'text-error', bg: 'bg-error-container' },
  FACTURA_VENCIDA: { icon: 'error', color: 'text-error', bg: 'bg-error-container' },
  PAGO_EXITOSO: { icon: 'check_circle', color: 'text-tertiary', bg: 'bg-tertiary-fixed/20' },
  PAGO_FALLIDO: { icon: 'cancel', color: 'text-error', bg: 'bg-error-container' },
  AUTOPAGO_EJECUTADO: { icon: 'autorenew', color: 'text-primary', bg: 'bg-primary-fixed' },
  FACTURA_POR_VENCER: { icon: 'schedule', color: 'text-secondary', bg: 'bg-secondary-fixed' },
  PAGO_CONFIRMADO: { icon: 'check_circle', color: 'text-tertiary', bg: 'bg-tertiary-fixed/20' },
  ANALISIS_LISTO: { icon: 'psychology', color: 'text-primary', bg: 'bg-primary-fixed' },
  DEFAULT: { icon: 'notifications', color: 'text-on-surface-variant', bg: 'bg-surface-container-high' },
};

function groupByDay(notifications) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const groups = { Hoy: [], Ayer: [], 'Esta semana': [], Anteriores: [] };

  for (const n of notifications) {
    const d = new Date(n.fechaCreacion || n.createdAt);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - d) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) groups['Hoy'].push(n);
    else if (diffDays === 1) groups['Ayer'].push(n);
    else if (diffDays <= 7) groups['Esta semana'].push(n);
    else groups['Anteriores'].push(n);
  }

  return Object.entries(groups).filter(([, items]) => items.length > 0);
}

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll().then((r) => r.data),
  });

  const markRead = useMutation({
    mutationFn: (id) => notificationsApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.content || data || [];
  const grouped = groupByDay(notifications);

  const handleNotificationClick = (n) => {
    markRead.mutate(n.id);
    const facturaTypes = ['FACTURA_AGREGADA', 'FACTURA_POR_VENCER', 'FACTURA_VENCE_7_DIAS', 'FACTURA_VENCE_3_DIAS', 'FACTURA_VENCE_HOY', 'FACTURA_VENCIDA'];
    if (facturaTypes.includes(n.tipo)) {
      if (n.referenciaId) navigate(`/invoices/${n.referenciaId}`);
      else navigate('/invoices');
    } else if (n.tipo === 'PAGO_CONFIRMADO' || n.tipo === 'PAGO_EXITOSO') {
      if (n.referenciaId) navigate(`/payments/result/${n.referenciaId}`);
    } else if (n.tipo === 'PAGO_FALLIDO') {
      navigate('/payments');
    } else if (n.tipo === 'ANALISIS_LISTO') {
      navigate('/ai');
    } else if (n.tipo === 'AUTOPAGO_EJECUTADO') {
      navigate('/autopay');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pt-8 pb-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-on-surface">Notificaciones</h1>
        {notifications.some((n) => !n.leida) && (
          <button
            onClick={() => notificationsApi.markAllAsRead().then(() => queryClient.invalidateQueries({ queryKey: ['notifications'] }))}
            className="text-sm text-primary font-bold hover:underline"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface-container-high rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-4 opacity-50">
          <Icon name="notifications_off" className="text-6xl text-outline-variant" />
          <p className="font-bold text-on-surface">Sin notificaciones</p>
        </div>
      ) : (
        grouped.map(([group, items]) => (
          <div key={group}>
            <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3">{group}</h2>
            <div className="space-y-2">
              {items.map((n) => {
                const { icon, color, bg } = NOTIFICATION_ICONS[n.tipo] || NOTIFICATION_ICONS.DEFAULT;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-colors ${
                      n.leida ? 'bg-surface-container-lowest hover:bg-surface-container-low' : 'bg-primary/5 hover:bg-primary/10'
                    }`}
                  >
                    <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon name={icon} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm text-on-surface ${!n.leida ? 'font-bold' : 'font-medium'}`}>{n.titulo}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5 truncate">{n.mensaje || n.descripcion || ''}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-[10px] text-on-surface-variant">{n.fechaCreacion ? formatDateShort(n.fechaCreacion) : ''}</span>
                      {!n.leida && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
