import React, { useState } from 'react';
import { t } from '@/lib/i18n';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ChatWidget } from '@/components/ChatWidget';
import { JourneyStepper } from '@/components/JourneyStepper';
import { DeadlineCard } from '@/components/DeadlineCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Bell, 
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { caseState } = useApp();
  const [showReminders, setShowReminders] = useState(false);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSetReminders = async () => {
    if (!email || !consent) return;
    
    setReminderStatus('loading');
    
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          caseState: {
            scenario: caseState.scenario,
            incidentDate: caseState.incidentDate,
            acasStatus: caseState.acasStatus,
          },
        }),
      });
      
      if (response.ok) {
        setReminderStatus('success');
        toast.success(t('reminders.success'));
      } else {
        // API not connected, store locally
        localStorage.setItem('wrn-reminder-request', JSON.stringify({ email, timestamp: new Date().toISOString() }));
        setReminderStatus('success');
        toast.info(t('reminders.notConnected'));
      }
    } catch {
      // Store locally as fallback
      localStorage.setItem('wrn-reminder-request', JSON.stringify({ email, timestamp: new Date().toISOString() }));
      setReminderStatus('success');
      toast.info(t('reminders.notConnected'));
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        {t('app.skipToMain')}
      </a>

      <Header />

      <main id="main-content" className="flex-1 pb-24">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Deadline Card */}
            <section className="animate-fade-in">
              <DeadlineCard
                incidentDate={caseState.incidentDate}
                incidentDateUnknown={caseState.incidentDateUnknown}
                acasStatus={caseState.acasStatus}
              />
            </section>

            {/* Journey Stepper */}
            <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-foreground">{t('journey.title')}</h2>
                <p className="text-muted-foreground text-sm mt-1">{t('journey.subtitle')}</p>
              </div>
              <JourneyStepper acasStatus={caseState.acasStatus} />
            </section>

            {/* Reminders Section */}
            <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              {!showReminders ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowReminders(true)}
                  className="w-full min-h-tap"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {t('reminders.title')}
                </Button>
              ) : (
                <div className="bg-card border border-border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{t('reminders.title')}</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {t('reminders.description')}
                  </p>

                  {reminderStatus === 'success' ? (
                    <div className="flex items-center gap-2 text-status-ok p-3 bg-status-ok-bg rounded-lg">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">{t('reminders.success')}</span>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="reminder-email" className="text-sm font-medium">
                          {t('reminders.emailLabel')}
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reminder-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 min-h-tap"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="reminder-consent"
                          checked={consent}
                          onCheckedChange={(checked) => setConsent(checked === true)}
                        />
                        <label htmlFor="reminder-consent" className="text-sm text-foreground cursor-pointer">
                          {t('reminders.consent')}
                        </label>
                      </div>

                      <Button
                        onClick={handleSetReminders}
                        disabled={!email || !consent || reminderStatus === 'loading'}
                        className="w-full min-h-tap"
                      >
                        {reminderStatus === 'loading' ? 'Setting up...' : t('reminders.enable')}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <BottomNav />
      <ChatWidget />
    </div>
  );
}
