import React from 'react';
import { useApp } from '@/context/AppContext';
import { t, LANGUAGES, Language } from '@/lib/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, changeLanguage } = useApp();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Select value={language} onValueChange={(value) => changeLanguage(value as Language)}>
        <SelectTrigger 
          className="w-[180px] min-h-tap" 
          aria-label={t('language.title')}
        >
          <SelectValue placeholder={t('language.title')} />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className="min-h-tap flex items-center"
            >
              <span className="font-medium">{lang.nativeName}</span>
              {lang.code !== 'en-A2' && (
                <span className="text-muted-foreground ml-2">({lang.name})</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
