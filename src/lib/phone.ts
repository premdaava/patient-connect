import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const cleaned = phone.trim();
  if (!cleaned) return null;

  try {
    const phoneNumber = parsePhoneNumberFromString(cleaned, 'US');
    if (phoneNumber && phoneNumber.isValid()) {
      return phoneNumber.format('E.164');
    }
    // If not US or needs fallback, try parsing without default country if it starts with +
    const international = parsePhoneNumberFromString(cleaned);
    if (international && international.isValid()) {
      return international.format('E.164');
    }
  } catch {
    // fallback below
  }

  // Basic fallback: remove non-digits except leading plus
  const digits = cleaned.replace(/[^\d+]/g, '');
  if (digits.length >= 10) {
    if (digits.startsWith('+')) return digits;
    if (digits.length === 10) return `+1${digits}`;
    return `+${digits}`;
  }

  return cleaned;
}

export function formatPhoneDisplay(phone: string | null | undefined): string {
  if (!phone) return '';
  const normalized = normalizePhone(phone);
  if (!normalized) return phone;

  try {
    const phoneNumber = parsePhoneNumberFromString(normalized);
    if (phoneNumber) {
      return phoneNumber.formatNational();
    }
  } catch {
    // fallback
  }

  return phone;
}
