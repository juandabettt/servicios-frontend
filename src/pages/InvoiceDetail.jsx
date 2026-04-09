import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { invoicesApi } from '../api/invoices.api';
import StatusBadge from '../components/ui/StatusBadge';
import Icon from '../components/ui/Icon';
import { formatCOP } from '../utils/currency';
import { formatDate } from '../utils/dates';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoicesApi.getById(id).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-8 animate-pulse space-y-6">
        <div className="w-40 h-8 bg-surface-container-high rounded" />
        <div className="h-48 bg-surface-container-high rounded-3xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-surface-container-high rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 pt-8 pb-8 space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
        <Icon name="arrow_back" />
        <span className="font-medium">Volver</span>
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface">{invoice.proveedor || invoice.nombreProveedor}</h1>
          <p className="text-on-surface-variant mt-1">{invoice.tipoServicio}</p>
        </div>
        <StatusBadge status={invoice.estado} />
      </div>

      {/* Invoice image */}
      {invoice.urlFotoFactura ? (
        <img src={invoice.urlFotoFactura} alt="Factura" className="w-full rounded-3xl shadow-sm object-contain max-h-80" />
      ) : (
        <div className="w-full h-48 bg-surface-container-low rounded-3xl flex items-center justify-center">
          <Icon name="receipt_long" className="text-6xl text-outline-variant" />
        </div>
      )}

      {/* Details */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 space-y-4 border border-outline-variant/20">
        {[
          { label: 'Período', value: invoice.periodoFacturado },
          { label: 'Fecha de vencimiento', value: invoice.fechaVencimiento ? formatDate(invoice.fechaVencimiento) : '-' },
          { label: 'Monto total', value: formatCOP(invoice.montoTotal) },
          invoice.consumo && { label: 'Consumo', value: `${invoice.consumo} ${invoice.unidadConsumo || ''}` },
          { label: 'Referencia', value: invoice.referencia || invoice.id },
        ].filter(Boolean).map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center py-2 border-b border-outline-variant/20 last:border-0">
            <span className="text-sm text-on-surface-variant">{label}</span>
            <span className="text-sm font-bold text-on-surface">{value}</span>
          </div>
        ))}
      </div>

      {/* CTA buttons */}
      <div className="flex gap-4">
        {invoice.estado === 'PENDIENTE' && (
          <button
            onClick={() => navigate(`/payments/${invoice.id}`)}
            className="flex-1 py-4 bg-primary text-on-primary font-bold rounded-full hover:opacity-90 active:scale-95 transition-all"
          >
            Pagar ahora
          </button>
        )}
        {invoice.estado === 'PAGADA' && (
          <button className="flex-1 py-4 bg-surface-container-low text-on-surface font-bold rounded-full hover:bg-surface-container transition-colors flex items-center justify-center gap-2">
            <Icon name="receipt" />
            Ver comprobante
          </button>
        )}
        <button
          onClick={() => navigate(`/invoices/upload`)}
          className="py-4 px-6 bg-surface-container-low text-on-surface font-bold rounded-full hover:bg-surface-container transition-colors"
        >
          <Icon name="edit" />
        </button>
      </div>
    </div>
  );
}
