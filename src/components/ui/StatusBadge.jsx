const STATUS_STYLES = {
  PENDIENTE: 'bg-blue-100 text-blue-700',
  PAGADA: 'bg-green-100 text-green-700',
  VENCIDA: 'bg-red-100 text-red-700',
  PROCESANDO: 'bg-gray-100 text-gray-600 animate-pulse',
  PROCESANDO_OCR: 'bg-gray-100 text-gray-600 animate-pulse',
  ERROR_OCR: 'bg-orange-100 text-orange-700',
};

const STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  PAGADA: 'Pagada',
  VENCIDA: 'Vencida',
  PROCESANDO: 'Procesando...',
  PROCESANDO_OCR: 'Procesando OCR...',
  ERROR_OCR: 'Error OCR',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600';
  const label = STATUS_LABELS[status] || status;

  return (
    <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${style}`}>
      {label}
    </span>
  );
}
