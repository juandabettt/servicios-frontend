import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';

const SLIDES = [
  {
    badge: 'Paso 01 de 03',
    title: 'Todas tus facturas en un solo lugar',
    description:
      'Centraliza Energía, Agua, Gas e Internet. Nunca más pierdas una fecha de pago ni busques entre papeles.',
    icon: 'receipt_long',
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-primary',
    visual: (
      <div className="relative z-10 bg-surface-container-lowest rounded-[2.5rem] shadow-[0px_32px_64px_-16px_rgba(0,83,68,0.12)] p-8 border border-outline-variant/20">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
            </div>
            <div>
              <h4 className="font-bold text-on-surface">Mis Facturas</h4>
              <p className="text-xs text-on-surface-variant">4 servicios activos</p>
            </div>
          </div>
          <div className="space-y-3">
            {['Agua (EMPOPASTO)', 'Energía (CEDENAR)', 'Gas Natural', 'Internet'].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                <span className="text-sm font-medium text-on-surface">{s}</span>
                <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-error' : i === 3 ? 'bg-tertiary' : 'bg-secondary'}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    badge: 'Paso 02 de 03',
    title: 'Paga con Nequi, PSE o tarjeta',
    description:
      'Escoge el método que más te convenga. Tus pagos quedan registrados y puedes ver tu historial completo en cualquier momento.',
    icon: 'account_balance_wallet',
    iconBg: 'bg-secondary-fixed',
    iconColor: 'text-secondary',
    visual: (
      <div className="relative z-10 bg-surface-container-lowest rounded-[2.5rem] shadow-[0px_32px_64px_-16px_rgba(0,83,68,0.12)] p-8 border border-outline-variant/20">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
            <div>
              <h4 className="font-bold text-on-surface">Métodos de Pago</h4>
              <p className="text-xs text-on-surface-variant">Rápido y seguro</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Nequi', icon: 'phone_android', color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'PSE', icon: 'account_balance', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Tarjeta', icon: 'credit_card', color: 'text-secondary', bg: 'bg-secondary-fixed' },
            ].map(({ label, icon, color, bg }) => (
              <div key={label} className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
                <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center`}>
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <span className="font-medium text-on-surface">{label}</span>
                <span className="ml-auto text-on-surface-variant text-xs">Disponible</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    badge: 'Paso 03 de 03',
    title: 'La IA analiza tu consumo y te ayuda a ahorrar',
    description:
      'Nuestro concierge digital detecta patrones de gasto y te ofrece consejos personalizados para reducir tus facturas mensuales automáticamente.',
    icon: 'psychology',
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-primary',
    visual: (
      <div className="relative z-10 bg-surface-container-lowest rounded-[2.5rem] shadow-[0px_32px_64px_-16px_rgba(0,83,68,0.12)] p-8 border border-outline-variant/20">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div>
              <h4 className="font-bold text-on-surface">Asistente IA</h4>
              <p className="text-xs text-on-surface-variant">Análisis de consumo hoy</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-end gap-2 h-32 px-2">
              <div className="w-full bg-surface-container-high rounded-t-lg h-[40%]" />
              <div className="w-full bg-surface-container-high rounded-t-lg h-[60%]" />
              <div className="w-full bg-primary-container rounded-t-lg h-[90%]" />
              <div className="w-full bg-surface-container-high rounded-t-lg h-[50%]" />
              <div className="w-full bg-surface-container-high rounded-t-lg h-[70%]" />
            </div>
            <div className="p-4 bg-tertiary-container/10 border border-tertiary/20 rounded-2xl flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary">trending_down</span>
              <p className="text-sm font-medium text-tertiary-container">¡Ahorraste un 12% este mes!</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const slide = SLIDES[currentSlide];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 max-w-[1440px] mx-auto overflow-hidden bg-surface">
      {/* Fixed gradient decorations */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="fixed bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

      {/* Logo */}
      <header className="w-full flex justify-center mb-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-primary brand-font">ServiciosYa</span>
        </div>
      </header>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Visual */}
        <div className="relative order-2 lg:order-1 flex justify-center">
          <div className="relative w-full aspect-square max-w-md">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
            {slide.visual}
            <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40 max-w-[200px] hidden sm:block">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">Ahorro Estimado</span>
                <span className="text-2xl font-bold text-on-surface">$42.500</span>
                <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-secondary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copy */}
        <div className="flex flex-col gap-8 order-1 lg:order-2 text-center lg:text-left">
          <div className="space-y-4">
            <span className="inline-block px-4 py-1.5 bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold rounded-full uppercase tracking-widest">
              {slide.badge}
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-on-surface leading-[1.1] tracking-tight">
              {slide.title}
            </h2>
            <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed">
              {slide.description}
            </p>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center lg:justify-start gap-3">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`rounded-full transition-all ${
                  i === currentSlide ? 'w-8 h-2.5 bg-primary' : 'w-2.5 h-2.5 bg-outline-variant'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {currentSlide < SLIDES.length - 1 ? (
              <>
                <button
                  onClick={() => setCurrentSlide((s) => s + 1)}
                  className="px-10 py-5 bg-primary text-white font-bold rounded-full hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-lg"
                >
                  Siguiente
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-10 py-5 bg-transparent text-primary font-bold rounded-full border-2 border-primary/10 hover:bg-primary/5 active:scale-95 transition-all text-lg"
                >
                  Ya tengo cuenta
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/register')}
                  className="px-10 py-5 bg-primary text-white font-bold rounded-full hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-lg"
                >
                  Comenzar
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-10 py-5 bg-transparent text-primary font-bold rounded-full border-2 border-primary/10 hover:bg-primary/5 active:scale-95 transition-all text-lg"
                >
                  Ya tengo cuenta
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
