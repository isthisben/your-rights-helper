import React, { useState } from 'react';
import { t } from '@/lib/i18n';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ChatWidget } from '@/components/ChatWidget';
import { AccessibilityBar } from '@/components/AccessibilityBar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { RefreshCw, Download, Mail } from 'lucide-react';
import { sendExportSnapshot } from '@/integrations/activepieces/client';

export default function SettingsPage() {
  const { resetCase, caseState } = useApp();
  const [isExporting, setIsExporting] = useState(false);
  const [exportEmail, setExportEmail] = useState(caseState.legalAdvisor?.email || '');

  const handleReset = () => {
    if (window.confirm('Are you sure you want to start over? This will clear all your saved information.')) {
      resetCase();
      toast.success('All information cleared. You can start fresh.');
    }
  };

  const handleExportSnapshot = async () => {
    if (isExporting) return;

    // Get email - use stored email or prompt user
    let email = exportEmail.trim() || caseState.legalAdvisor?.email;
    
    if (!email) {
      const userEmail = prompt('Enter your email address to receive the export:');
      if (!userEmail) {
        toast.error('Email is required to send the export.');
        return;
      }
      email = userEmail.trim();
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsExporting(true);

    try {
      await sendExportSnapshot({
        caseState,
        timestamp: new Date().toISOString(),
        email,
        metadata: {
          format: 'json',
          includeDocuments: true,
        },
      });

      toast.success('Export requested! You will receive an email shortly.');
      setExportEmail(email); // Save email for next time
    } catch (error) {
      console.error('Failed to send export snapshot webhook:', error);
      toast.error('Failed to request export. Please try again.');
    } finally {
      setIsExporting(false);
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

            {/* Export Section */}
            <section className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-foreground">Export Case Data</h3>
              <p className="text-sm text-muted-foreground">
                Export your complete case information as a snapshot. You'll receive an email with your case data.
              </p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="export-email" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                  <Input
                    id="export-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={exportEmail}
                    onChange={(e) => setExportEmail(e.target.value)}
                    className="min-h-tap"
                  />
                </div>
                <Button 
                  onClick={handleExportSnapshot} 
                  disabled={isExporting}
                  className="min-h-tap w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Snapshot'}
                </Button>
              </div>
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
