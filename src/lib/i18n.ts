import enA2 from '@/locales/en-A2.json';
import cy from '@/locales/cy.json';
import pl from '@/locales/pl.json';
import ur from '@/locales/ur.json';
import pa from '@/locales/pa.json';
import bn from '@/locales/bn.json';
import ro from '@/locales/ro.json';
import ar from '@/locales/ar.json';

export type Language = 'en-A2' | 'cy' | 'pl' | 'ur' | 'pa' | 'bn' | 'ro' | 'ar';

export const LANGUAGES: { code: Language; name: string; nativeName: string; rtl?: boolean }[] = [
  { code: 'en-A2', name: 'English (Simple)', nativeName: 'English' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', rtl: true },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
];

const translations: Record<Language, Record<string, unknown>> = {
  'en-A2': enA2,
  cy,
  pl,
  ur,
  pa,
  bn,
  ro,
  ar,
};

const STORAGE_KEY = 'wrn-language';

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'en-A2';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && translations[stored as Language]) {
    return stored as Language;
  }
  return 'en-A2';
}

export function setLanguage(lang: Language): void {
  localStorage.setItem(STORAGE_KEY, lang);
  // Update document direction for RTL languages
  const langConfig = LANGUAGES.find(l => l.code === lang);
  document.documentElement.dir = langConfig?.rtl ? 'rtl' : 'ltr';
  document.documentElement.lang = lang.split('-')[0];
}

export function t(key: string, params?: Record<string, string | number>): string {
  const lang = getLanguage();
  const keys = key.split('.');
  
  // Try to get from current language
  let value: unknown = translations[lang];
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      value = undefined;
      break;
    }
  }
  
  // Fallback to English
  if (value === undefined) {
    value = translations['en-A2'];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        value = key; // Return key if not found
        break;
      }
    }
  }
  
  let result = typeof value === 'string' ? value : key;
  
  // Replace parameters like {{name}}
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      result = result.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(paramValue));
    });
  }
  
  return result;
}

export function isRTL(): boolean {
  const lang = getLanguage();
  const langConfig = LANGUAGES.find(l => l.code === lang);
  return langConfig?.rtl ?? false;
}
