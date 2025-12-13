import React from 'react';
import { t } from '@/lib/i18n';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ChatWidget } from '@/components/ChatWidget';
import { AccessibilityBar } from '@/components/AccessibilityBar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const { resetCase } = useApp();

  const handleReset = () => {
    if (window.confirm('Are you sure you want to start over? This will clear all your saved information.')) {
      resetCase();
      toast.success('All information cleared. You can start fresh.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        {t('app.skipToMain')}
      </a>

      <Header />

      <main id="main-content" className="flex-1 pb-24">
        <div className="container mx-auto px-3 py-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">{t('settings.title')}</h2>

            {/* Language Section */}
            <section className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-foreground">{t('language.title')}</h3>
              <LanguageSwitcher />
            </section>

            {/* Accessibility Section */}
            <section className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-medium text-foreground">{t('accessibility.title')}</h3>
              </div>
              <AccessibilityBar />
            </section>

            {/* Reset Section */}
            <section className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-foreground">Reset</h3>
              <p className="text-sm text-muted-foreground">
                Start over with a fresh case. This will clear all your saved information.
              </p>
              <Button variant="destructive" onClick={handleReset} className="min-h-tap">
                <RefreshCw className="h-4 w-4 mr-2" />
                Start Over
              </Button>
            </section>
          </div>
        </div>
      </main>

      <BottomNav />
      <ChatWidget />
    </div>
  );
}
