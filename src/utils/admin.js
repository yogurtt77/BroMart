export const unwrapResponseData = (payload) => payload?.data ?? payload;

export const SECURITY_REGIME_LABELS = {
  GENERAL: 'Общий режим',
  STRICT: 'Строгий режим',
  MAXIMUM: 'Максимальный режим'
};

export const ORDER_STATUS_LABELS = {
  PENDING: 'Ожидает',
  APPROVED: 'Одобрен',
  REJECTED: 'Отклонён'
};

export const ORDER_STATUS_COLORS = {
  PENDING: 'gold',
  APPROVED: 'green',
  REJECTED: 'red'
};

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Супер-администратор',
  PRISON_ADMIN: 'Начальник учреждения',
  INMATE: 'Заключённый'
};

export const securityRegimeOptions = Object.entries(SECURITY_REGIME_LABELS).map(([value, label]) => ({
  value,
  label
}));

export const orderStatusOptions = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
  value,
  label
}));

export const formatCurrency = (value) => new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'KZT',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
}).format(Number(value || 0));

export const formatNumber = (value) => new Intl.NumberFormat('ru-RU').format(Number(value || 0));

export const formatDate = (value) => {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(value));
};

export const formatDateTime = (value) => {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
};

export const getPercent = (value, maxValue) => {
  if (!maxValue) {
    return 0;
  }

  return Math.round((Number(value || 0) / Number(maxValue)) * 100);
};

export const getApiErrorMessage = (error, fallback) => error?.response?.data?.message || fallback;

export const formatSecurityRegime = (value) => SECURITY_REGIME_LABELS[value] || value || '—';

export const formatOrderStatus = (value) => ORDER_STATUS_LABELS[value] || value || '—';

export const formatRole = (value) => ROLE_LABELS[value] || value || '—';
