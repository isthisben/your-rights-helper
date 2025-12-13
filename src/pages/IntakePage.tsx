import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { useApp } from '@/context/AppContext';
import { Scenario, AcasStatus } from '@/types/case';
import { validateDateInput } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ChatWidget } from '@/components/ChatWidget';
import { ChipSelector } from '@/components/ChipSelector';
import { LegalAdvisorForm } from '@/components/LegalAdvisorForm';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid } from 'date-fns';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar as CalendarIcon,
  Briefcase,
  Clock,
  Users,
  AlertCircle,
  Accessibility,
  HelpCircle,
  CheckCircle2,
  Edit3
} from 'lucide-react';

const TOTAL_STEPS = 5;

const SCENARIO_OPTIONS: { value: Scenario; labelKey: string; icon: React.ReactNode }[] = [
  { value: 'fired', labelKey: 'intake.step1.options.fired', icon: <Briefcase className="h-4 w-4" /> },
  { value: 'hourscut', labelKey: 'intake.step1.options.hourscut', icon: <Clock className="h-4 w-4" /> },
  { value: 'jobchanged', labelKey: 'intake.step1.options.jobchanged', icon: <Edit3 className="h-4 w-4" /> },
  { value: 'bullying', labelKey: 'intake.step1.options.bullying', icon: <Users className="h-4 w-4" /> },
  { value: 'adjustments', labelKey: 'intake.step1.options.adjustments', icon: <Accessibility className="h-4 w-4" /> },
  { value: 'notsure', labelKey: 'intake.step1.options.notsure', icon: <HelpCircle className="h-4 w-4" /> },
];

const ACAS_OPTIONS: { value: AcasStatus; labelKey: string }[] = [
  { value: 'started', labelKey: 'intake.step3.options.started' },
  { value: 'not_started', labelKey: 'intake.step3.options.notStarted' },
  { value: 'unknown', labelKey: 'intake.step3.options.notSure' },
];

export default function IntakePage() {
  const navigate = useNavigate();
  const { caseState, updateCaseState } = useApp();
  const [step, setStep] = useState(caseState.currentIntakeStep || 0);
  
  // Local form state
  const [scenario, setScenario] = useState<Scenario | null>(caseState.scenario);
  const [incidentDate, setIncidentDate] = useState<Date | undefined>(() => {
    if (caseState.incidentDate) {
      const parsed = parseISO(caseState.incidentDate);
      return isValid(parsed) ? parsed : undefined;
    }
    return undefined;
  });
  const [dateUnknown, setDateUnknown] = useState(caseState.incidentDateUnknown);
  const [acasStatus, setAcasStatus] = useState<AcasStatus>(caseState.acasStatus);
  const [acasDate, setAcasDate] = useState<Date | undefined>(() => {
    if (caseState.acasStartDate) {
      const parsed = parseISO(caseState.acasStartDate);
      return isValid(parsed) ? parsed : undefined;
    }
    return undefined;
  });

  // Save progress on step change
  useEffect(() => {
    const incidentDateStr = incidentDate && isValid(incidentDate) 
      ? incidentDate.toISOString().split('T')[0] 
      : null;
    const acasDateStr = acasDate && isValid(acasDate)
      ? acasDate.toISOString().split('T')[0]
      : null;
    
    updateCaseState({
      currentIntakeStep: step,
      scenario,
      incidentDate: incidentDateStr,
      incidentDateUnknown: dateUnknown,
      acasStatus,
      acasStartDate: acasDateStr,
    });
  }, [step, scenario, incidentDate, dateUnknown, acasStatus, acasDate, updateCaseState]);

  const canGoNext = () => {
    switch (step) {
      case 0: return scenario !== null;
      case 1: return incidentDate !== undefined || dateUnknown;
      case 2: return true; // ACAS
      case 3: return true; // Legal advisor (optional)
      case 4: return true; // Summary
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      // Complete intake
      updateCaseState({ intakeCompleted: true });
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{t('intake.step1.title')}</h2>
              <p className="text-muted-foreground mt-1">{t('intake.step1.subtitle')}</p>
            </div>
            <ChipSelector
              options={SCENARIO_OPTIONS.map(opt => ({
                value: opt.value,
                label: t(opt.labelKey),
                icon: opt.icon,
              }))}
              value={scenario}
              onChange={(val) => setScenario(val as Scenario)}
              ariaLabel={t('intake.step1.title')}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{t('intake.step2.title')}</h2>
              <p className="text-muted-foreground mt-1">{t('intake.step2.subtitle')}</p>
            </div>
            
            {!dateUnknown && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t('intake.step2.dateLabel')}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal min-h-tap',
                        !incidentDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {incidentDate ? format(incidentDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={incidentDate}
                      onSelect={setIncidentDate}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Checkbox
                id="date-unknown"
                checked={dateUnknown}
                onCheckedChange={(checked) => {
                  setDateUnknown(checked === true);
                  if (checked) setIncidentDate(undefined);
                }}
              />
              <label htmlFor="date-unknown" className="text-sm text-foreground cursor-pointer">
                {t('intake.step2.notSure')}
              </label>
            </div>

            {dateUnknown && (
              <div className="bg-status-warning-bg border border-status-warning-border rounded-lg p-4">
                <p className="text-sm text-foreground flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-status-warning flex-shrink-0 mt-0.5" />
                  {t('intake.step2.approxHint')}
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{t('intake.step3.title')}</h2>
              <p className="text-muted-foreground mt-1">{t('intake.step3.subtitle')}</p>
            </div>

            <div className="bg-primary-light rounded-lg p-4">
              <p className="text-sm text-foreground">{t('intake.step3.explanation')}</p>
            </div>

            <ChipSelector
              options={ACAS_OPTIONS.map(opt => ({
                value: opt.value,
                label: t(opt.labelKey),
              }))}
              value={acasStatus}
              onChange={(val) => setAcasStatus(val as AcasStatus)}
              ariaLabel={t('intake.step3.title')}
            />

            {acasStatus === 'started' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t('intake.step3.dateLabel')}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal min-h-tap',
                        !acasDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {acasDate ? format(acasDate, 'PPP') : <span>Pick a date (optional)</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={acasDate}
                      onSelect={setAcasDate}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <LegalAdvisorForm compact onComplete={() => setStep(4)} />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{t('intake.step4.title')}</h2>
              <p className="text-muted-foreground mt-1">{t('intake.step4.subtitle')}</p>
            </div>

            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">{t('intake.step4.situation')}</span>
                  <p className="font-medium text-foreground">
                    {scenario ? t(`intake.step1.options.${scenario}`) : '-'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
                  {t('intake.step4.edit')}
                </Button>
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">{t('intake.step4.date')}</span>
                  <p className="font-medium text-foreground">
                    {dateUnknown 
                      ? t('intake.step4.dateUnknown')
                      : incidentDate ? format(incidentDate, 'PPP') : '-'
                    }
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  {t('intake.step4.edit')}
                </Button>
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">{t('intake.step4.acasStatus')}</span>
                  <p className="font-medium text-foreground">
                    {t(`intake.step3.options.${acasStatus === 'not_started' ? 'notStarted' : acasStatus === 'started' ? 'started' : 'notSure'}`)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                  {t('intake.step4.edit')}
                </Button>
              </div>
              
              {caseState.legalAdvisor?.name && (
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-sm text-muted-foreground">{t('legalAdvisor.title')}</span>
                    <p className="font-medium text-foreground">
                      {caseState.legalAdvisor.name}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
                    {t('intake.step4.edit')}
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-status-ok-bg border border-status-ok-border rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-status-ok flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                {t('intake.step4.saved')}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        {t('app.skipToMain')}
      </a>

      <Header />

      <main id="main-content" className="flex-1 pb-32">
        <div className="container mx-auto px-4 py-6">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>{t('intake.progress', { current: step + 1, total: TOTAL_STEPS })}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="max-w-lg mx-auto">
            {renderStep()}
          </div>
        </div>
      </main>

      {/* Navigation buttons */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border p-4 safe-area-bottom">
        <div className="container mx-auto max-w-lg flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="min-h-tap flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('intake.navigation.back')}
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!canGoNext()}
            className="min-h-tap flex-1"
          >
            {step === TOTAL_STEPS - 1 ? t('intake.navigation.finish') : t('intake.navigation.next')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <BottomNav />
      <ChatWidget />
    </div>
  );
}
