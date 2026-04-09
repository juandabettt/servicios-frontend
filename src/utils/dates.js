export const daysUntil = (dateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
};

export const formatDate = (dateString, opts = {}) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...opts,
  }).format(date);
};

export const formatDateShort = (dateString) =>
  new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));

export const urgencyClass = (fechaVencimiento) => {
  const days = daysUntil(fechaVencimiento);
  if (days < 0) {
    return {
      bg: 'bg-error',
      text: 'text-on-error',
      label: 'Vencida',
    };
  }
  if (days < 3) {
    return {
      bg: 'bg-error-container',
      text: 'text-on-error-container',
      label: `Vence en ${days} día${days !== 1 ? 's' : ''}`,
    };
  }
  if (days <= 7) {
    return {
      bg: 'bg-secondary-fixed',
      text: 'text-on-secondary-fixed-variant',
      label: `Vence en ${days} días`,
    };
  }
  return {
    bg: 'bg-surface-container-high',
    text: 'text-on-surface-variant',
    label: `Vence en ${days} días`,
  };
};
