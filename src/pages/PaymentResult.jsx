import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../api/payments.api';
import Icon from '../components/ui/Icon';
import { formatCOP } from '../utils/currency';
import { formatDate } from '../utils/dates';

export default function PaymentResult() {
  const { transactionId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['payment', transactionId],
    queryFn: () => paymentsApi.getStatus(transactionId).then((r) => r.data),
    enabled: !!transactionId,
  });

  const payment = data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-fixed border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isApproved = payment?.estado === 'APROBADA';
  const isRejected = payment?.estado === 'RECHAZADA';

  return (
    <div className="max-w-md mx-auto px-6 pt-8 pb-8 flex flex-col items-center text-center space-y-8">
      {/* Status icon */}
      <div className={`w-28 h-28 rounded-full flex items-center justify-center ${isApproved ? 'bg-green-100' : 'bg-error-container'}`}>
        {isApproved ? (
          <svg className="w-14 h-14" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="24" stroke="#16a34a" strokeWidth="4" fill="none" />
            <path d="M18 28 L25 35 L38 20" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-check" />
          </svg>
        ) : (
          <Icon name="error" filled className="text-6xl text-error" />
        )}
      </div>

      <div>
        <h1 className="text-3xl font-black text-on-surface">
          {isApproved ? '¡Pago exitoso!' : isRejected ? 'Pago rechazado' : 'Estado desconocido'}
        </h1>
        {isRejected && (
          <p className="text-on-surface-variant mt-3">
            No pudimos procesar tu pago. Por favor verifica tu método de pago e intenta de nuevo.
          </p>
        )}
      </div>

      {/* Transaction details */}
      {payment && (
        <div className="bg-surface-container-lowest w-full rounded-3xl p-6 space-y-4 border border-outline-variant/20">
          {[
            payment.monto && { label: 'Monto', value: formatCOP(payment.monto) },
            payment.metodoPago && { label: 'Método', value: payment.metodoPago },
            payment.transactionId && { label: 'Transacción', value: payment.transactionId },
            payment.fecha && { label: 'Fecha', value: formatDate(payment.fecha) },
          ].filter(Boolean).map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-1.5 border-b border-outline-variant/20 last:border-0">
              <span className="text-sm text-on-surface-variant">{label}</span>
              <span className="text-sm font-bold text-on-surface">{value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 w-full">
        {isApproved && (
          <button
            onClick={() => {}}
            className="w-full py-4 bg-surface-container-low text-on-surface font-bold rounded-full hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="receipt" />
            Ver comprobante
          </button>
        )}
        {isRejected && (
          <button
            onClick={() => navigate(-1)}
            className="w-full py-4 bg-primary text-on-primary font-bold rounded-full hover:opacity-90 active:scale-95 transition-all"
          >
            Intentar de nuevo
          </button>
        )}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-4 border-2 border-outline-variant text-on-surface font-bold rounded-full hover:bg-surface-container-low transition-colors"
        >
          Ir al inicio
        </button>
      </div>
    </div>
  );
}
