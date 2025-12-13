import { CaseState, DEFAULT_CASE_STATE } from '@/types/case';

const STORAGE_KEY = 'wrn-case-state';

export function loadCaseState(): CaseState {
  if (typeof window === 'undefined') return DEFAULT_CASE_STATE;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_CASE_STATE, ...parsed };
    }
  } catch (e) {
    console.error('Error loading case state:', e);
  }
  
  return DEFAULT_CASE_STATE;
}

export function saveCaseState(state: CaseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving case state:', e);
  }
}

export function clearCaseState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing case state:', e);
  }
}
