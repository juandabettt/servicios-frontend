export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirmar', danger = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-surface-container-lowest rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fade-in-up">
        <h3 className="text-xl font-bold text-on-surface mb-2">{title}</h3>
        <p className="text-on-surface-variant mb-8">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-full border-2 border-outline-variant text-on-surface font-bold hover:bg-surface-container-low transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-full font-bold transition-colors ${
              danger
                ? 'bg-error text-on-error hover:opacity-90'
                : 'bg-primary text-on-primary hover:opacity-90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
