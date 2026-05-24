import {
  formatOrderStatus as formatMappedOrderStatus,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS
} from './orderStatus';

export const unwrapResponseData = payload => payload?.data ?? payload;

export const SECURITY_REGIME_LABELS = {
  GENERAL: 'Общий режим',
  STRICT: 'Строгий режим',
  MAXIMUM: 'Максимальный режим'
};

export const SECURITY_REGIME_COLORS = {
  GENERAL: 'green',
  STRICT: 'gold',
  MAXIMUM: 'red'
};

export { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS };

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Супер-администратор',
  PRISON_ADMIN: 'Начальник учреждения',
  WAREHOUSE_MANAGER: 'Менеджер склада',
  COURIER: 'Курьер',
  INMATE: 'Заключённый'
};

export const securityRegimeOptions = Object.entries(SECURITY_REGIME_LABELS).map(([value, label]) => ({
  value,
  label
}));

export const orderStatusOptions = ORDER_STATUS_OPTIONS;

export const formatCurrency = value => new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'KZT',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
}).format(Number(value || 0));

export const formatNumber = value => new Intl.NumberFormat('ru-RU').format(Number(value || 0));

export const formatDate = value => {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(value));
};

export const formatDateTime = value => {
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

export const formatSecurityRegime = value => SECURITY_REGIME_LABELS[value] || value || '—';

export const getSecurityRegimeColor = value => SECURITY_REGIME_COLORS[value] || 'default';

export const formatOrderStatus = value => formatMappedOrderStatus(value);

export const formatRole = value => ROLE_LABELS[value] || value || '—';
