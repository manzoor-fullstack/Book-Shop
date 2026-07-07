import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateName } from './validation';

describe('validation', () => {
  it('validates email addresses', () => {
    expect(validateEmail('a@b.com')).toBe(true);
    expect(validateEmail('bad-email')).toBe(false);
    expect(validateEmail('a@b')).toBe(false);
  });

  it('enforces password strength rules', () => {
    expect(validatePassword('Abc12345').isValid).toBe(true);
    expect(validatePassword('short').isValid).toBe(false);
    expect(validatePassword('alllowercase1').isValid).toBe(false);
    expect(validatePassword('NONUMBERS').isValid).toBe(false);
  });

  it('validates names', () => {
    expect(validateName('Ali')).toBe(true);
    expect(validateName('A')).toBe(false);
    expect(validateName('  ')).toBe(false);
  });
});
