import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { invoicesApi } from '../api/invoices.api';
import { propertiesApi } from '../api/properties.api';
import { aiApi } from '../api/ai.api';
import InvoiceCard from '../components/ui/InvoiceCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Icon from '../components/ui/Icon';
import { formatCOP } from '../utils/currency';
import { urgencyClass } from '../utils/dates';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: propertiesData, isLoading: loadingProperties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.getAll().then((r) => r.data),
  });

  const hasProperties = propertiesData &&
    (Array.isArray(propertiesData) ? propertiesData.length > 0 :
    propertiesData?.content?.length > 0);

  const { data: invoicesData, isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices', { estado: 'PENDIENTE' }],
    queryFn: () => invoicesApi.getAll({ estado: 'PENDIENTE', size: 4 }).then((r) => r.data),
    enabled: hasProperties,
  });

  const { data: insightsData } = useQuery({
    queryKey: ['ai-insights/recommendations'],
    queryFn: () => aiApi.getRecommendations().then((r) => r.data),
    enabled: hasProperties,
    retry: false,
    throwOnError: false,
    staleTime: 5 * 60 * 1000,
  });

  const invoices = invoicesData?.content || invoicesData || [];
  const pendientes = invoices.filter((f) => f.estado === 'PENDIENTE').length;
  const pagadas = invoices.filter((f) => f.estado === 'PAGADA').length;
  const vencidas = invoices.filter((f) => f.estado === 'VENCIDA').length;
  const totalAPagar = invoices.reduce((sum, inv) => sum + (inv.montoTotal || 0), 0);
  const nextDue = invoices.sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento))[0];

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 space-y-8 pb-8">
      {/* Hero Summary */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-primary-container p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div>
            <p className="text-primary-fixed/80 font-medium tracking-wide mb-1">Total a pagar este mes</p>
            <h1 className="text-5xl font-black brand-font tracking-tight mb-2">
              {formatCOP(totalAPagar)}
            </h1>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1 w-fit">
              <Icon name="pending_actions" className="text-sm" />
              <span className="text-xs font-bold">{pendientes} Facturas pendientes{vencidas > 0 ? ` · ${vencidas} vencidas` : ''}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate('/payments/bulk')}
              className="bg-secondary text-white font-bold py-4 px-8 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Pagar todo</span>
              <Icon name="arrow_forward" />
            </button>
            {nextDue && (
              <p className="text-[10px] text-white/60 text-center">
                Próximo vencimiento: {new Date(nextDue.fechaVencimiento).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}
              </p>
            )}
          </div>
        </div>
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary-fixed/10 rounded-full blur-2xl" />
      </section>

      {/* Banner sin propiedades */}
      {!hasProperties && !loadingProperties && (
        <div className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-on-surface">
              Configura tu primera propiedad
            </h3>
            <p className="text-on-surface-variant mt-2">
              Para comenzar a gestionar tus facturas necesitas registrar al menos una propiedad o inmueble.
            </p>
          </div>
          <button
            onClick={() => navigate('/properties')}
            className="px-8 py-4 bg-primary text-on-primary font-bold rounded-full hover:opacity-90 active:scale-95 transition-all whitespace-nowrap flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add_home</span>
            Agregar propiedad
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Invoices + Quick Actions */}
        <div className="lg:col-span-8 space-y-8">
          {/* Upcoming invoices */}
          <div>
            <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Próximos vencimientos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loadingInvoices
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                : invoices.length > 0
                ? invoices.slice(0, 4).map((invoice) => {
                    const urgency = invoice.fechaVencimiento ? urgencyClass(invoice.fechaVencimiento) : null;
                    return (
                      <div
                        key={invoice.id}
                        className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <Icon name="receipt_long" />
                          </div>
                          {urgency && (
                            <span className={`${urgency.bg} ${urgency.text} text-[10px] font-bold px-2.5 py-1 rounded-full`}>
                              {urgency.label}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-on-surface">{invoice.proveedor || invoice.nombreProveedor}</h4>
                        <p className="text-2xl font-black text-primary mt-1">{formatCOP(invoice.montoTotal)}</p>
                        <div className="mt-4 flex justify-between items-center text-xs text-on-surface-variant">
                          <span>Ref: {invoice.referencia || invoice.id?.substring(0, 8)}</span>
                          <button className="text-primary font-bold hover:underline">Ver detalle</button>
                        </div>
                      </div>
                    );
                  })
                : (
                  <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center opacity-60">
                    <Icon name="receipt_long" className="text-6xl text-outline-variant mb-4" />
                    <p className="font-bold text-on-surface">Sin facturas pendientes</p>
                    <p className="text-sm text-on-surface-variant mt-1">¡Estás al día!</p>
                  </div>
                )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: 'upload_file', label: 'Subir factura', path: '/invoices/upload' },
              { icon: 'credit_card', label: 'Métodos pago', path: '/profile' },
              { icon: 'analytics', label: 'Análisis IA', path: '/ai' },
              { icon: 'history', label: 'Historial', path: '/invoices' },
            ].map(({ icon, label, path }) => (
              <button
                key={icon}
                onClick={() => navigate(path)}
                className="flex flex-col items-center justify-center p-6 bg-surface-container-low rounded-2xl hover:bg-primary-fixed transition-colors"
              >
                <Icon name={icon} className="text-3xl mb-3 text-primary" />
                <span className="text-xs font-bold text-on-surface text-center">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: AI Insights */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="w-1.5 h-6 bg-secondary rounded-full" />
            AI Insights
          </h3>
          <div className="bg-surface-container-highest rounded-[1.5rem] p-6 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                <Icon name="psychology" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Consumo detectado</h4>
                <p className="text-[10px] text-on-surface-variant">
                  {insightsData ? 'Actualizado hoy' : 'Sin datos aún'}
                </p>
              </div>
            </div>
            <div className="space-y-4 relative z-10">
              {insightsData?.content?.slice(0, 2).map((insight, i) => (
                <div
                  key={i}
                  className={`bg-surface-container-lowest/60 backdrop-blur-sm p-4 rounded-xl border-l-4 ${
                    i === 0 ? 'border-error' : 'border-tertiary'
                  }`}
                >
                  <p className="text-sm font-medium text-on-surface">{insight.titulo}</p>
                  <p className="text-xs text-on-surface-variant mt-2">{insight.descripcion?.substring(0, 80)}...</p>
                </div>
              )) || (
                <>
                  <div className="bg-surface-container-lowest/60 p-4 rounded-xl border-l-4 border-error">
                    <p className="text-sm font-medium text-on-surface">
                      Tu consumo de <span className="font-bold text-error">agua subió 34%</span> respecto al mes pasado.
                    </p>
                    <p className="text-xs text-on-surface-variant mt-2">
                      Recomendamos revisar posibles fugas.
                    </p>
                  </div>
                  <div className="bg-surface-container-lowest/60 p-4 rounded-xl border-l-4 border-tertiary">
                    <p className="text-sm font-medium text-on-surface">
                      ¡Buen ahorro en <span className="font-bold text-tertiary">energía</span>!
                    </p>
                    <p className="text-xs text-on-surface-variant mt-2">
                      Estás un 12% por debajo del promedio de tu zona.
                    </p>
                  </div>
                </>
              )}
              <button
                onClick={() => navigate('/ai')}
                className="w-full py-3 text-sm font-bold text-primary border border-primary/20 rounded-full hover:bg-primary/5 transition-colors"
              >
                Ver reporte completo
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          </div>

          {/* Property info */}
          {propertiesData?.length > 0 && (
            <div className="bg-surface-container-low rounded-2xl p-6">
              <h4 className="text-sm font-bold mb-4">Propiedad principal</h4>
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <p className="text-[10px] text-on-surface-variant uppercase">Estrato</p>
                  <p className="font-bold">{propertiesData[0]?.estrato || '-'}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-on-surface-variant uppercase">Servicios</p>
                  <p className="font-bold">Activos</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-on-surface-variant uppercase">Puntaje</p>
                  <p className="font-bold text-tertiary">98/100</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAB chat */}
      <button
        className="fixed right-6 bottom-24 md:bottom-8 w-14 h-14 bg-secondary text-white rounded-full shadow-[0px_12px_32px_rgba(25,28,29,0.15)] flex items-center justify-center hover:scale-110 active:scale-90 transition-transform z-40"
        onClick={() => {}}
      >
        <Icon name="chat" filled />
      </button>
    </div>
  );
}
