/**
 * Utilidades para manejo de fechas y cálculo del periodo de renta (3 días)
 */

export function calculateRentalDates(): {
  rentedAt: string;
  returnDueAt: string;
} {
  const rentedAt = new Date();
  // Renta de exactamente 3 días de inicio a fin
  const returnDueAt = new Date(rentedAt.getTime() + 3 * 24 * 60 * 60 * 1000);

  return {
    rentedAt: rentedAt.toISOString(),
    returnDueAt: returnDueAt.toISOString(),
  };
}

export function formatRentalDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getRemainingRentalTime(returnDueAtString: string): {
  isExpired: boolean;
  text: string;
} {
  try {
    const now = new Date().getTime();
    const due = new Date(returnDueAtString).getTime();
    const diffMs = due - now;

    if (diffMs <= 0) {
      return { isExpired: true, text: 'Renta vencida' };
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remHours = diffHours % 24;

    if (diffDays > 0) {
      return {
        isExpired: false,
        text: `${diffDays}d ${remHours}h restantes`,
      };
    }
    return {
      isExpired: false,
      text: `${diffHours}h restantes`,
    };
  } catch {
    return { isExpired: false, text: '3 días restantes' };
  }
}
