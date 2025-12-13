import React, { useState } from 'react';
import { t } from '@/lib/i18n';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ChatWidget } from '@/components/ChatWidget';
import { JourneyStepper } from '@/components/JourneyStepper';
import { JourneyProgressSidebar } from '@/components/JourneyProgressSidebar';
import { DeadlineCard } from '@/components/DeadlineCard';
import { ContactHumanButton } from '@/components/ContactHumanButton';
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
import { motion } from 'framer-motion';

const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

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

      {/* Progress Sidebar */}
      <JourneyProgressSidebar 
        journeyProgress={caseState.journeyProgress}
        acasStatus={caseState.acasStatus}
      />

      <main id="main-content" className="flex-1 pb-28 lg:pr-72">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto space-y-10">
            {/* Contact Human Button - always visible */}
            <motion.div 
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
              className="flex justify-end"
            >
              <ContactHumanButton variant="outline" size="sm" />
            </motion.div>

            {/* Deadline Card */}
            <motion.section 
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
            >
              <DeadlineCard
                incidentDate={caseState.incidentDate}
                incidentDateUnknown={caseState.incidentDateUnknown}
                acasStatus={caseState.acasStatus}
              />
            </motion.section>

            {/* Journey Stepper */}
            <motion.section 
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
            >
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-foreground tracking-tight">{t('journey.title')}</h2>
                <p className="text-muted-foreground text-sm mt-1.5">{t('journey.subtitle')}</p>
              </div>
              <JourneyStepper acasStatus={caseState.acasStatus} />
            </motion.section>

            {/* Reminders Section */}
            <motion.section 
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
            >
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
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-card border border-border/60 rounded-2xl p-6 space-y-5 shadow-soft"
                >
                  <div className="flex items-center gap-2.5">
                    <Bell className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold tracking-tight">{t('reminders.title')}</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('reminders.description')}
                  </p>

                  {reminderStatus === 'success' ? (
                    <div className="flex items-center gap-2.5 text-status-ok p-4 bg-status-ok-bg rounded-xl">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">{t('reminders.success')}</span>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2.5">
                        <label htmlFor="reminder-email" className="text-sm font-medium">
                          {t('reminders.emailLabel')}
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reminder-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-11 min-h-tap rounded-xl border-border/60"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="reminder-consent"
                          checked={consent}
                          onCheckedChange={(checked) => setConsent(checked === true)}
                          className="mt-0.5"
                        />
                        <label htmlFor="reminder-consent" className="text-sm text-foreground cursor-pointer leading-relaxed">
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
                </motion.div>
              )}
            </motion.section>
          </div>
        </div>
      </main>

      <BottomNav />
      <ChatWidget />
    </div>
  );
}
