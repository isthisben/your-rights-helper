import { CaseState, DEFAULT_CASE_STATE } from '@/types/case';
import { toast } from 'sonner';

const STORAGE_KEY = 'wrn-case-state';

export interface StorageError {
  type: 'quota' | 'permission' | 'unknown';
  message: string;
}

function handleStorageError(error: unknown, operation: 'save' | 'load' | 'clear'): StorageError {
  const errorObj = error as Error & { code?: number; name?: string };
  
  if (errorObj.name === 'QuotaExceededError' || errorObj.code === 22) {
    return {
      type: 'quota',
      message: 'Storage quota exceeded. Please free up some space and try again.',
    };
  }
  
  if (errorObj.name === 'SecurityError' || errorObj.code === 18) {
    return {
      type: 'permission',
      message: 'Storage access denied. Please check your browser settings.',
    };
  }
  
  return {
    type: 'unknown',
    message: `Failed to ${operation} data. Please try again.`,
  };
}

export function loadCaseState(): CaseState {
  if (typeof window === 'undefined') return DEFAULT_CASE_STATE;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_CASE_STATE, ...parsed };
    }
  } catch (e) {
    const error = handleStorageError(e, 'load');
    // Only show error in development or if it's a critical error
    if (import.meta.env.DEV) {
      console.error('Error loading case state:', error.message);
    }
    // Don't show toast on load errors to avoid annoying users
  }
  
  return DEFAULT_CASE_STATE;
}

export function saveCaseState(state: CaseState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    const error = handleStorageError(e, 'save');
    toast.error(error.message);
    return false;
  }
}

export function clearCaseState(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    const error = handleStorageError(e, 'clear');
    toast.error(error.message);
    return false;
  }
}
