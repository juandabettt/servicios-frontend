import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/ui/Icon';

const FAQ = [
  {
    q: '¿Cómo subir una factura?',
    a: 'Ve al panel principal y toca el botón "Subir factura". Puedes subir una foto o PDF de tu factura de servicios. El sistema la procesará automáticamente con inteligencia artificial.',
  },
  {
    q: '¿Cómo funciona el autopago?',
    a: 'El autopago te permite programar pagos automáticos de tus facturas. Ve a Perfil → Autopago, actívalo y configura el monto máximo permitido por pago.',
  },
  {
    q: '¿Cómo cambiar mi contraseña?',
    a: 'Ve a Perfil → Seguridad → Cambiar contraseña. Ingresa tu contraseña actual y luego la nueva contraseña dos veces para confirmar.',
  },
  {
    q: '¿Cómo eliminar una factura?',
    a: 'Abre la factura que deseas eliminar desde la sección de Facturas, toca el ícono de opciones (tres puntos) y selecciona "Eliminar". Se pedirá confirmación antes de eliminar.',
  },
];

function AccordionItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b border-outline-variant/10 last:border-0 transition-colors ${open ? 'bg-primary/5' : ''}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <span className="font-semibold text-on-surface text-sm">{question}</span>
        <Icon
          name={open ? 'expand_less' : 'expand_more'}
          className={`text-on-surface-variant flex-shrink-0 transition-transform ${open ? 'rotate-0' : ''}`}
        />
      </button>
      {open && (
        <p className="px-6 pb-4 text-sm text-on-surface-variant leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

export default function AyudaSoporte() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-6 pt-8 pb-8 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
        >
          <Icon name="arrow_back" className="text-on-surface" />
        </button>
        <h1 className="text-2xl font-extrabold text-on-surface">Ayuda y soporte</h1>
      </div>

      {/* FAQ */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest px-1">Preguntas frecuentes</h2>
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 overflow-hidden">
          {FAQ.map((item) => (
            <AccordionItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
      </section>

      {/* Contacto */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest px-1">Contacto</h2>
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center">
            <Icon name="mail" className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">Soporte técnico</p>
            <a
              href="mailto:soporte@serviciosya.com"
              className="text-sm text-primary hover:underline"
            >
              soporte@serviciosya.com
            </a>
          </div>
        </div>
      </section>

      {/* Versión */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest px-1">Versión de la app</h2>
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center">
            <Icon name="info" className="text-on-surface-variant" />
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">ServiciosYa</p>
            <p className="text-sm text-on-surface-variant">v1.0.0</p>
          </div>
        </div>
      </section>
    </div>
  );
}
