import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../api/ai.api';
import { propertiesApi } from '../api/properties.api';
import { invoicesApi } from '../api/invoices.api';
import InsightCard from '../components/ui/InsightCard';
import Icon from '../components/ui/Icon';
import { formatCOP } from '../utils/currency';
import toast from 'react-hot-toast';

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN'];

export default function AiInsights() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('Energía');
  const [analyzing, setAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.getAll().then((r) => r.data),
    onSuccess: (data) => {
      if (data?.length && !selectedProperty) setSelectedProperty(data[0]?.id);
    },
  });

  const propertyId = selectedProperty || properties?.[0]?.id;

  const { data: recommendations, isLoading: loadingRec } = useQuery({
    queryKey: ['ai-insights/recommendations', propertyId],
    queryFn: () => aiApi.getRecommendations({ propertyId }).then((r) => r.data),
    enabled: !!propertyId,
  });

  const { data: predictions } = useQuery({
    queryKey: ['ai-insights/predictions', propertyId, 'ENERGIA'],
    queryFn: () => aiApi.getPredictions(propertyId, 'ENERGIA').then((r) => r.data),
    enabled: !!propertyId,
  });

  const { data: benchmark } = useQuery({
    queryKey: ['ai-insights/benchmark', propertyId, 'ENERGIA'],
    queryFn: () => aiApi.getBenchmark(propertyId, 'ENERGIA').then((r) => r.data),
    enabled: !!propertyId,
  });

  const { data: invoiceHistory } = useQuery({
    queryKey: ['invoices', { propertyId }],
    queryFn: () => invoicesApi.getAll({ propertyId, size: 50 }).then((r) => r.data),
    enabled: !!propertyId,
  });

  const handleTriggerAnalysis = async () => {
    setAnalyzing(true);
    try {
      await aiApi.triggerAnalysis(propertyId);
      // Poll for new results
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        await queryClient.invalidateQueries({ queryKey: ['ai-insights/recommendations'] });
        if (attempts >= 6) {
          clearInterval(poll);
          setAnalyzing(false);
          toast.success('Análisis completado');
        }
      }, 5000);
    } catch {
      setAnalyzing(false);
    }
  };

  // Build chart data from invoice history
  const invoices = invoiceHistory?.content || invoiceHistory || [];
  const serviceFilter = { Energía: 'ENERGIA', Agua: 'AGUA', Gas: 'GAS' }[activeTab];
  const filteredInvoices = invoices.filter((inv) => inv.tipoServicio?.toUpperCase() === serviceFilter);
  const maxAmount = Math.max(...filteredInvoices.map((inv) => inv.montoTotal || 0), 1);

  const insights = recommendations?.content || recommendations || [];

  return (
    <div className="md:ml-0 min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl px-6 py-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-primary-container/20 p-2 rounded-xl">
              <Icon name="psychology" filled className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-primary font-headline leading-none">Análisis IA</h2>
              <p className="text-sm text-on-surface-variant font-medium mt-1">Optimizando tu consumo diario</p>
            </div>
          </div>
        </div>

        {/* Property selector */}
        <div className="flex items-center gap-3 bg-surface-container-low p-2 rounded-2xl overflow-x-auto scrollbar-hide">
          {properties?.map((prop) => (
            <button
              key={prop.id}
              onClick={() => {
                setSelectedProperty(prop.id);
                queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors ${
                propertyId === prop.id
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Icon name="home" className="text-sm" />
              {prop.nombre || prop.direccion}
            </button>
          )) || (
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold text-sm">
              <Icon name="home" className="text-sm" /> Mi propiedad
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-xl font-medium text-sm whitespace-nowrap transition-colors">
            <Icon name="add" className="text-sm" /> Nueva Propiedad
          </button>
        </div>
      </header>

      <section className="px-6 space-y-8">
        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Prediction card */}
          <div className="md:col-span-7 lg:col-span-8 bg-primary-container/10 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[320px]">
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-primary text-on-primary rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Predicción IA
                </span>
                {predictions?.confianza && (
                  <span className="text-primary font-bold flex items-center gap-1 text-sm">
                    <Icon name="verified" className="text-sm" />
                    Confianza {predictions.confianza}%
                  </span>
                )}
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-primary mt-6 font-headline">
                Próxima factura energía
              </h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-black text-primary">
                  {predictions?.montoEstimado ? formatCOP(predictions.montoEstimado) : '$108.000'}
                </span>
                <span className="text-on-surface-variant font-medium">estimado</span>
              </div>
            </div>
            <div className="relative z-10 mt-8">
              <div className="flex justify-between text-xs font-bold text-primary/60 mb-2">
                <span>Rango esperado</span>
                <span>
                  {predictions
                    ? `${formatCOP(predictions.rangoMin)} — ${formatCOP(predictions.rangoMax)}`
                    : '$102k — $114k'}
                </span>
              </div>
              <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-primary rounded-full relative">
                  <div className="absolute right-0 -top-1 w-4 h-4 bg-primary border-4 border-white rounded-full" />
                </div>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          </div>

          {/* Benchmark */}
          <div className="md:col-span-5 lg:col-span-4 bg-secondary-container/10 rounded-3xl p-8 flex flex-col justify-between border-l-4 border-secondary">
            <div>
              <Icon name="groups" className="text-secondary text-4xl mb-4" />
              <h4 className="text-xl font-extrabold text-secondary font-headline">Vs. Vecinos</h4>
              <p className="text-on-surface-variant mt-2 leading-relaxed">
                {benchmark?.porcentajeDiferencia
                  ? `Estás usando un ${benchmark.porcentajeDiferencia > 0 ? '+' : ''}${benchmark.porcentajeDiferencia}% energía que propiedades similares.`
                  : 'Estás usando un 18% más energía que propiedades similares en tu zona.'}
              </p>
            </div>
            <div className="mt-6 flex gap-4">
              <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase">Tu consumo</p>
                <p className="text-xl font-black text-secondary">{benchmark?.tuConsumo || '240kWh'}</p>
              </div>
              <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase">Promedio</p>
                <p className="text-xl font-black text-on-surface">{benchmark?.promedioVecinos || '203kWh'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Historical chart */}
        <div className="bg-surface-container-low rounded-[32px] p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h3 className="text-2xl font-extrabold font-headline">Histórico de Consumo</h3>
              <p className="text-on-surface-variant text-sm">Últimos 6 meses de actividad</p>
            </div>
            <div className="flex bg-surface-container-high p-1.5 rounded-2xl gap-1">
              {['Energía', 'Agua', 'Gas'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-primary text-white font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-[240px] w-full flex items-end justify-between gap-2 md:gap-8 pt-8 px-2 md:px-6">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              {[0, 1, 2, 3].map((i) => <div key={i} className="border-t border-on-surface-variant" />)}
            </div>

            {filteredInvoices.length > 0
              ? filteredInvoices.slice(-6).map((inv, i) => {
                  const heightPct = Math.max(((inv.montoTotal || 0) / maxAmount) * 100, 5);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                      <div
                        className="w-full max-w-[40px] bg-primary rounded-t-xl transition-all group-hover:opacity-80"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-xs font-bold text-on-surface-variant">
                        {new Date(inv.fechaVencimiento || Date.now()).toLocaleDateString('es-CO', { month: 'short' }).toUpperCase()}
                      </span>
                    </div>
                  );
                })
              : MONTHS.map((month, i) => {
                  const heights = [40, 60, 55, 75, 90, 65];
                  const opacities = [20, 20, 40, 60, 80, 100];
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-3 group">
                      <div
                        className={`w-full max-w-[40px] bg-primary/${opacities[i]} rounded-t-xl transition-all group-hover:opacity-80`}
                        style={{ height: `${heights[i]}%` }}
                      />
                      <span className={`text-xs font-bold ${i === 5 ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {month}
                      </span>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="text-2xl font-extrabold font-headline">Recomendaciones IA</h3>
            <button className="text-primary font-bold text-sm hover:underline">Ver todo</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.length > 0
              ? insights.slice(0, 4).map((insight) => <InsightCard key={insight.id} insight={insight} />)
              : (
                <>
                  <InsightCard insight={{
                    id: '1',
                    icono: 'eco',
                    titulo: 'Optimiza el uso de la lavadora',
                    descripcion: 'Tu consumo de agua y luz sube un 30% los martes. Lava cargas completas los fines de semana para ahorrar hasta $12.000.',
                  }} />
                  <InsightCard insight={{
                    id: '2',
                    icono: 'bolt',
                    titulo: 'Consumo "Vampiro" detectado',
                    descripcion: 'Identificamos un consumo base de 12kWh entre las 2 AM y 5 AM. Revisa cargadores o electrodomésticos en stand-by.',
                  }} />
                </>
              )}
          </div>
        </div>

        {/* Savings goal CTA */}
        <div className="bg-primary p-8 rounded-[32px] text-on-primary flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
          <div className="relative z-10 space-y-4 max-w-lg">
            <h3 className="text-2xl md:text-3xl font-extrabold font-headline">Estás a $4.500 de tu meta mensual</h3>
            <p className="opacity-80">Si mantienes tu ritmo de consumo actual, podrías ahorrar un 5% adicional este mes.</p>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div className="bg-secondary h-full rounded-full w-[85%] shadow-[0_0_15px_rgba(251,120,0,0.5)]" />
            </div>
          </div>
          <div className="relative z-10">
            <button
              onClick={handleTriggerAnalysis}
              disabled={analyzing}
              className="bg-white text-primary font-black py-4 px-8 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-70"
            >
              {analyzing ? 'Analizando...' : 'Ver Plan de Ahorro'}
            </button>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-[-20deg] translate-x-10 pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
