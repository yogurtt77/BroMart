export const ORDER_STATUS_META = {
  PENDING: {
    label: 'Ожидает одобрения',
    color: 'gold',
    order: 1
  },
  APPROVED: {
    label: 'Одобрен',
    color: 'green',
    order: 2
  },
  PACKING: {
    label: 'В сборке',
    color: 'purple',
    order: 3
  },
  READY_FOR_SHIPMENT: {
    label: 'Готов к отправке',
    color: 'cyan',
    order: 4
  },
  OUT_FOR_DELIVERY: {
    label: 'В пути',
    color: 'blue',
    order: 5
  },
  ARRIVED_AT_FACILITY: {
    label: 'Прибыл в учреждение',
    color: 'geekblue',
    order: 6
  },
  DELIVERED: {
    label: 'Доставлен',
    color: 'success',
    order: 7
  },
  FAILED_DELIVERY: {
    label: 'Проблема с доставкой',
    color: 'volcano',
    order: 8
  },
  REJECTED: {
    label: 'Отклонён',
    color: 'red',
    order: 9
  },
  CANCELLED: {
    label: 'Отменён',
    color: 'default',
    order: 10
  }
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_META);

export const ORDER_STATUS_LABELS = Object.fromEntries(
  Object.entries(ORDER_STATUS_META).map(([status, meta]) => [status, meta.label])
);

export const ORDER_STATUS_COLORS = Object.fromEntries(
  Object.entries(ORDER_STATUS_META).map(([status, meta]) => [status, meta.color])
);

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_META)
  .sort(([, first], [, second]) => first.order - second.order)
  .map(([value, meta]) => ({
    value,
    label: meta.label
  }));

export const formatOrderStatus = value => ORDER_STATUS_LABELS[value] || value || '—';

export const getOrderStatusColor = value => ORDER_STATUS_COLORS[value] || 'default';

export const getOrderTimelineStep = value => {
  if (value === 'PENDING' || value === 'REJECTED' || value === 'CANCELLED') {
    return 0;
  }

  if (value === 'APPROVED') {
    return 1;
  }

  if (value === 'PACKING') {
    return 2;
  }

  if (value === 'READY_FOR_SHIPMENT') {
    return 3;
  }

  if (value === 'OUT_FOR_DELIVERY') {
    return 4;
  }

  if (value === 'ARRIVED_AT_FACILITY' || value === 'FAILED_DELIVERY') {
    return 5;
  }

  if (value === 'DELIVERED') {
    return 6;
  }

  return 0;
};
