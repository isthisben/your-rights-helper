import React from 'react';
import { t } from '@/lib/i18n';
import { Scale } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card border-b border-border py-4 px-4">
      <div className="container mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Scale className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-semibold text-lg text-foreground">{t('app.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('app.subtitle')}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
