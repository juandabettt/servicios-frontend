import { useState } from 'react';
import Icon from './Icon';
import { aiApi } from '../../api/ai.api';
import toast from 'react-hot-toast';

export default function InsightCard({ insight }) {
  const [voted, setVoted] = useState(null);

  const handleFeedback = async (calificacion) => {
    if (voted) return;
    setVoted(calificacion);
    try {
      await aiApi.submitFeedback(insight.id, calificacion);
      toast.success('¡Gracias por tu feedback!');
    } catch {
      setVoted(null);
    }
  };

  return (
    <div className="bg-surface-container-lowest p-6 rounded-3xl flex gap-6 border border-transparent hover:border-primary-fixed transition-all">
      <div className="bg-tertiary-container/10 p-4 rounded-2xl h-fit">
        <Icon name={insight.icono || 'eco'} filled className="text-tertiary" />
      </div>
      <div className="space-y-3 flex-1">
        <h5 className="text-lg font-bold font-headline leading-tight">{insight.titulo}</h5>
        <p className="text-on-surface-variant text-sm leading-relaxed">{insight.descripcion}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleFeedback('POSITIVO')}
            disabled={!!voted}
            className={`p-1.5 rounded-lg transition-colors ${
              voted === 'POSITIVO'
                ? 'bg-green-100 text-green-700'
                : 'hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <Icon name="thumb_up" />
          </button>
          <button
            onClick={() => handleFeedback('NEGATIVO')}
            disabled={!!voted}
            className={`p-1.5 rounded-lg transition-colors ${
              voted === 'NEGATIVO'
                ? 'bg-red-100 text-red-700'
                : 'hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <Icon name="thumb_down" />
          </button>
        </div>
      </div>
    </div>
  );
}
