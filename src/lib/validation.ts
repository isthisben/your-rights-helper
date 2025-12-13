/**
 * Validation utilities
 */

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isValidDate(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0];
  } catch {
    return false;
  }
}

export function validateDateInput(dateString: string): { valid: boolean; error?: string } {
  if (!dateString || dateString.trim() === '') {
    return { valid: false, error: 'Date is required' };
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  if (date > new Date()) {
    return { valid: false, error: 'Date cannot be in the future' };
  }
  
  return { valid: true };
}

