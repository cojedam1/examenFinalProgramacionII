/**
 * Utilidades para manejo seguro de números ficticios de tarjeta de crédito
 * Cifra/Oculta todos los dígitos excepto los últimos cuatro
 */

export function cleanCardDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 16);
}

export function formatCardDisplay(digits: string): string {
  const clean = cleanCardDigits(digits);
  return clean.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function maskCreditCard(digits: string): {
  masked: string;
  lastFour: string;
  formatted: string;
} {
  const clean = cleanCardDigits(digits);
  const lastFour = clean.length >= 4 ? clean.slice(-4) : clean.padEnd(4, '0');
  
  // Si tiene menos de 16 dígitos, rellenamos ficticiamente para formato visual
  const padded = clean.padEnd(16, '0');
  const last4 = padded.slice(-4);
  
  // Ocultar los primeros 12 dígitos y mostrar solo los últimos 4
  const masked = '•••• •••• •••• ' + last4;
  const formatted = formatCardDisplay(padded);

  return {
    masked,
    lastFour: last4,
    formatted,
  };
}

export function isValidCreditCardLength(digits: string): boolean {
  const clean = cleanCardDigits(digits);
  return clean.length >= 15 && clean.length <= 16;
}
