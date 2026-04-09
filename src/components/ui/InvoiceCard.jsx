import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import StatusBadge from './StatusBadge';
import { formatCOP } from '../../utils/currency';

const SERVICE_ICONS = {
  AGUA: { icon: 'water_drop', bg: 'bg-blue-50', color: 'text-blue-600' },
  ENERGIA: { icon: 'bolt', bg: 'bg-yellow-50', color: 'text-yellow-700' },
  GAS: { icon: 'mode_heat', bg: 'bg-orange-50', color: 'text-orange-600' },
  INTERNET: { icon: 'router', bg: 'bg-purple-50', color: 'text-purple-600' },
  TV: { icon: 'tv', bg: 'bg-indigo-50', color: 'text-indigo-600' },
  DEFAULT: { icon: 'receipt_long', bg: 'bg-surface-container-high', color: 'text-on-surface-variant' },
};

const BORDER_COLORS = {
  PENDIENTE: 'border-primary',
  PAGADA: 'border-tertiary',
  VENCIDA: 'border-error',
  DEFAULT: 'border-secondary',
};

export default function InvoiceCard({ invoice, variant = 'list' }) {
  const navigate = useNavigate();
  const serviceKey = invoice.tipoServicio?.toUpperCase() || 'DEFAULT';
  const { icon, bg, color } = SERVICE_ICONS[serviceKey] || SERVICE_ICONS.DEFAULT;
  const borderColor = BORDER_COLORS[invoice.estado] || BORDER_COLORS.DEFAULT;

  if (variant === 'dashboard') {
    return (
      <div
        className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => navigate(`/invoices/${invoice.id}`)}
      >
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center`}>
            <Icon name={icon} />
          </div>
          <StatusBadge status={invoice.estado} />
        </div>
        <h4 className="font-bold text-on-surface">{invoice.proveedor || invoice.nombreProveedor}</h4>
        <p className="text-2xl font-black text-primary mt-1">{formatCOP(invoice.montoTotal)}</p>
        <div className="mt-4 flex justify-between items-center text-xs text-on-surface-variant">
          <span>Ref: {invoice.referencia || invoice.id}</span>
          <button
            className="text-primary font-bold hover:underline"
            onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${invoice.id}`); }}
          >
            Ver detalle
          </button>
        </div>
      </div>
    );
  }

  return (
    <article
      className={`bg-surface-container-lowest p-5 rounded-xl border-l-4 ${borderColor} shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer`}
      onClick={() => navigate(`/invoices/${invoice.id}`)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${bg} flex items-center justify-center rounded-lg ${color}`}>
            <Icon name={icon} />
          </div>
          <div>
            <h3 className="font-bold text-teal-900">{invoice.proveedor || invoice.nombreProveedor}</h3>
            <p className="text-xs text-on-surface-variant font-medium">{invoice.tipoServicio}</p>
          </div>
        </div>
        <StatusBadge status={invoice.estado} />
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] text-outline uppercase font-bold tracking-widest mb-1">Periodo</p>
          <p className="text-sm font-semibold text-teal-900">{invoice.periodoFacturado}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-outline uppercase font-bold tracking-widest mb-1">Monto</p>
          <p className="text-xl font-black text-teal-900">{formatCOP(invoice.montoTotal)}</p>
        </div>
      </div>
    </article>
  );
}
