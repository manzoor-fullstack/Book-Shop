import { describe, it, expect } from 'vitest';
import { formatPrice, formatNumber, orderStatusTone, paymentTone } from './formatters';

describe('formatters', () => {
  it('formats prices as USD currency', () => {
    expect(formatPrice(14.99)).toBe('$14.99');
    expect(formatPrice(1000)).toBe('$1,000.00');
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('formats numbers with thousands separators', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(5)).toBe('5');
  });

  it('maps order statuses to badge tones', () => {
    expect(orderStatusTone('pending')).toBe('warning');
    expect(orderStatusTone('processing')).toBe('info');
    expect(orderStatusTone('shipped')).toBe('purple');
    expect(orderStatusTone('delivered')).toBe('success');
    expect(orderStatusTone('cancelled')).toBe('danger');
    expect(orderStatusTone('unknown')).toBe('gray');
  });

  it('maps payment statuses to badge tones', () => {
    expect(paymentTone('paid')).toBe('success');
    expect(paymentTone('failed')).toBe('danger');
    expect(paymentTone('pending')).toBe('warning');
  });
});
