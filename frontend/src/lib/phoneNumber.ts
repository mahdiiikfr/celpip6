import { toEnglishDigits } from './convertNumbers';

const stripNonDigits = (value: string) => value.replace(/\D+/g, '');

export const normalizeIranPhone = (input: string): string => {
  if (!input) return '';
  const digits = stripNonDigits(toEnglishDigits(input));
  if (!digits) return '';

  if (digits.startsWith('0098')) {
    return `0${digits.slice(4)}`;
  }
  if (digits.startsWith('98')) {
    return `0${digits.slice(2)}`;
  }
  if (digits.startsWith('0')) {
    return digits;
  }
  if (digits.startsWith('9')) {
    return `0${digits}`;
  }
  return digits;
};

export const toInternationalIranPhone = (normalized: string): string => {
  const digits = stripNonDigits(normalized);
  if (!digits) return '';
  if (digits.startsWith('0')) {
    return `+98${digits.slice(1)}`;
  }
  if (digits.startsWith('98')) {
    return `+${digits}`;
  }
  if (digits.startsWith('0098')) {
    return `+${digits.slice(2)}`;
  }
  return `+98${digits}`;
};
