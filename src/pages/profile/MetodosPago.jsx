import { useNavigate } from 'react-router-dom';
import Icon from '../../components/ui/Icon';
import toast from 'react-hot-toast';

export default function MetodosPago() {
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
        <h1 className="text-2xl font-extrabold text-on-surface">Métodos de pago</h1>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 overflow-hidden">
        <div className="flex flex-col items-center py-16 gap-4 px-6">
          <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center">
            <Icon name="credit_card_off" className="text-4xl text-on-surface-variant/50" />
          </div>
          <p className="font-bold text-on-surface">No tienes métodos de pago guardados aún</p>
          <p className="text-sm text-on-surface-variant text-center">
            Agrega una tarjeta, PSE o Nequi para pagar tus facturas más fácil.
          </p>
        </div>
      </div>

      <button
        onClick={() => toast('Función disponible próximamente', { icon: '🔜' })}
        className="w-full py-4 bg-primary text-on-primary font-bold rounded-full hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <Icon name="add" />
        Agregar método de pago
      </button>
    </div>
  );
}
