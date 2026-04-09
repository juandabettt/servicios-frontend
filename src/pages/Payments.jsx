import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { invoicesApi } from '../api/invoices.api';
import { paymentsApi } from '../api/payments.api';
import { usePolling } from '../hooks/usePolling';
import Icon from '../components/ui/Icon';
import { formatCOP } from '../utils/currency';
import toast from 'react-hot-toast';

const BANCOS = [
  'Bancolombia', 'Davivienda', 'BBVA', 'Banco de Bogotá', 'Banco Popular',
  'Banco Occidente', 'Banco Caja Social', 'Nequi Bank', 'Bancamía',
];

const METODOS = [
  { id: 'NEQUI', label: 'Nequi', icon: 'phone_android', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'PSE', label: 'PSE', icon: 'account_balance', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'TARJETA_CREDITO', label: 'Tarjeta', icon: 'credit_card', color: 'text-secondary', bg: 'bg-secondary-fixed' },
];

function formatCard(value) {
  return value.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

export default function Payments() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  const [metodo, setMetodo] = useState(null);
  const [nequiPhone, setNequiPhone] = useState('');
  const [banco, setBanco] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [psePollEnabled, setPsePollEnabled] = useState(false);
  const [transactionId, setTransactionId] = useState(null);

  const { data: invoice } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => invoicesApi.getById(invoiceId).then((r) => r.data),
    enabled: !!invoiceId,
  });

  // PSE polling
  const { data: pollData } = usePolling({
    queryFn: () => paymentsApi.getStatus(transactionId),
    stopCondition: (data) => {
      const d = data?.data ?? data;
      return d?.estado && d.estado !== 'PENDIENTE_PSE';
    },
    intervalMs: 5000,
    timeoutMs: 300000,
    enabled: psePollEnabled && !!transactionId,
  });

  if (psePollEnabled && pollData) {
    const d = pollData?.data ?? pollData;
    if (d?.estado && d.estado !== 'PENDIENTE_PSE') {
      setPsePollEnabled(false);
      navigate(`/payments/result/${transactionId}`);
    }
  }

  const handleConfirm = async () => {
    if (!metodo) { toast.error('Selecciona un método de pago'); return; }

    setProcessing(true);
    try {
      const extraData = {};
      if (metodo === 'NEQUI') extraData.telefonoCelular = nequiPhone;
      if (metodo === 'PSE') extraData.bancoCodigo = banco;
      if (metodo === 'TARJETA_CREDITO') {
        extraData.numeroTarjeta = cardNumber.replace(/\s/g, '');
        extraData.fechaExpiracion = cardExpiry;
        extraData.cvv = cardCvv;
      }

      const { data } = await paymentsApi.process(invoiceId, metodo, extraData);

      if (metodo === 'PSE' && data.urlRedireccionPse) {
        window.open(data.urlRedireccionPse, '_blank');
        setTransactionId(data.transactionId || data.id);
        setPsePollEnabled(true);
      } else {
        navigate(`/payments/result/${data.transactionId || data.id}`);
      }
    } catch {
      // Error handled by interceptor
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 pt-8 pb-8 space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
        <Icon name="arrow_back" />
        <span className="font-medium">Volver</span>
      </button>

      <h1 className="text-3xl font-extrabold text-on-surface">Pagar factura</h1>

      {/* Invoice summary */}
      {invoice && (
        <div className="bg-primary/5 rounded-3xl p-6 space-y-2">
          <p className="text-sm text-on-surface-variant">Estás pagando</p>
          <p className="font-bold text-on-surface">{invoice.proveedor || invoice.nombreProveedor}</p>
          <p className="text-sm text-on-surface-variant">{invoice.periodoFacturado}</p>
          <p className="text-3xl font-black text-primary">{formatCOP(invoice.montoTotal)}</p>
        </div>
      )}

      {/* PSE waiting screen */}
      {psePollEnabled ? (
        <div className="flex flex-col items-center py-12 gap-6 text-center">
          <div className="w-16 h-16 border-4 border-primary-fixed border-t-primary rounded-full animate-spin" />
          <div>
            <h2 className="text-xl font-bold text-on-surface">Esperando confirmación de tu banco...</h2>
            <p className="text-on-surface-variant mt-2 text-sm">Completa el pago en la ventana que se abrió.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Payment method selector */}
          <div className="space-y-3">
            <h2 className="font-bold text-on-surface">Método de pago</h2>
            {METODOS.map(({ id, label, icon, color, bg }) => (
              <button
                key={id}
                onClick={() => setMetodo(id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  metodo === id
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant hover:border-primary/40'
                }`}
              >
                <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center`}>
                  <Icon name={icon} />
                </div>
                <span className="font-bold text-on-surface">{label}</span>
                {metodo === id && <Icon name="check_circle" filled className="ml-auto text-primary" />}
              </button>
            ))}
          </div>

          {/* NEQUI extra */}
          {metodo === 'NEQUI' && (
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Número celular Nequi</label>
              <div className="flex">
                <span className="bg-surface-container-high border border-r-0 border-outline-variant rounded-l-xl px-3 flex items-center text-sm font-medium text-on-surface-variant">+57</span>
                <input
                  type="tel"
                  value={nequiPhone}
                  onChange={(e) => setNequiPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                  className="flex-1 bg-surface-container-low border border-outline-variant rounded-r-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  placeholder="3001234567"
                />
              </div>
            </div>
          )}

          {/* PSE extra */}
          {metodo === 'PSE' && (
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Banco</label>
              <select
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              >
                <option value="">Selecciona tu banco</option>
                {BANCOS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          )}

          {/* Card extra */}
          {metodo === 'TARJETA_CREDITO' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Número de tarjeta</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCard(e.target.value))}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none font-mono tracking-widest"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Vencimiento</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '').substring(0, 4);
                      if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2);
                      setCardExpiry(v);
                    }}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none font-mono"
                    placeholder="MM/AA"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">CVV</label>
                  <input
                    type="text"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none font-mono"
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={processing || !metodo}
            className="w-full py-4 bg-primary text-on-primary font-bold rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
          >
            {processing ? 'Procesando...' : `Pagar ${invoice ? formatCOP(invoice.montoTotal) : ''}`}
          </button>
        </>
      )}
    </div>
  );
}
