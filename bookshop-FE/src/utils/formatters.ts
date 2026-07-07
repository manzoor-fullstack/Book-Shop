export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateShort = (date: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

export const formatNumber = (n: number): string =>
  new Intl.NumberFormat('en-US').format(n);

type StatusTone = 'gray' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

export const orderStatusTone = (status: string): StatusTone => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'processing':
      return 'info';
    case 'shipped':
      return 'purple';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'gray';
  }
};

export const paymentTone = (status: string): StatusTone => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'failed':
      return 'danger';
    case 'refunded':
      return 'purple';
    default:
      return 'warning';
  }
};
