import React from 'react';
import { t } from '@/lib/i18n';
import { Scale } from 'lucide-react';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[hsl(15_99%_33%)] border-b border-border/40 py-5 px-4 sticky top-0 z-50"
    >
      <div className="container mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary shadow-soft flex items-center justify-center">
            <Scale className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-semibold text-lg text-white tracking-tight">{t('app.title')}</h1>
            <p className="text-xs text-white/80">{t('app.subtitle')}</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
