import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CaseState, DEFAULT_CASE_STATE, AccessibilitySettings } from '@/types/case';
import { loadCaseState, saveCaseState } from '@/lib/storage';
import { getLanguage, setLanguage as setI18nLanguage, Language } from '@/lib/i18n';

interface AppContextType {
  caseState: CaseState;
  updateCaseState: (updates: Partial<CaseState>) => void;
  updateAccessibility: (updates: Partial<AccessibilitySettings>) => void;
  resetCase: () => void;
  language: Language;
  changeLanguage: (lang: Language) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [caseState, setCaseState] = useState<CaseState>(() => loadCaseState());
  const [language, setLanguage] = useState<Language>(() => getLanguage());

  // Apply accessibility classes to document
  useEffect(() => {
    const { accessibility } = caseState;
    const html = document.documentElement;
    
    // Text size
    html.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
    html.classList.add(`text-size-${accessibility.textSize}`);
    
    // High contrast
    html.classList.toggle('high-contrast', accessibility.highContrast);
    
    // Reduce motion
    html.classList.toggle('reduce-motion', accessibility.reduceMotion);
    
    // Dyslexia font
    html.classList.toggle('dyslexia-font', accessibility.dyslexiaFont);
    
    // Colorblind mode
    html.classList.toggle('colorblind-mode', accessibility.colorblindMode);
  }, [caseState.accessibility]);

  // Persist case state
  useEffect(() => {
    const success = saveCaseState(caseState);
    if (!success && import.meta.env.DEV) {
      console.warn('Failed to save case state to localStorage');
    }
  }, [caseState]);

  const updateCaseState = useCallback((updates: Partial<CaseState>) => {
    setCaseState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateAccessibility = useCallback((updates: Partial<AccessibilitySettings>) => {
    setCaseState(prev => ({
      ...prev,
      accessibility: { ...prev.accessibility, ...updates },
    }));
  }, []);

  const resetCase = useCallback(() => {
    setCaseState({
      ...DEFAULT_CASE_STATE,
      language: caseState.language,
      accessibility: caseState.accessibility,
    });
  }, [caseState.language, caseState.accessibility]);

  const changeLanguage = useCallback((lang: Language) => {
    setI18nLanguage(lang);
    setLanguage(lang);
    updateCaseState({ language: lang });
  }, [updateCaseState]);

  return (
    <AppContext.Provider value={{
      caseState,
      updateCaseState,
      updateAccessibility,
      resetCase,
      language,
      changeLanguage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
