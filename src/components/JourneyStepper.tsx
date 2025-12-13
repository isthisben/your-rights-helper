import React, { useState } from 'react';
import { t } from '@/lib/i18n';
import { AcasStatus, JourneyStepKey, JourneyStepProgress } from '@/types/case';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertCircle, 
  CheckCircle2, 
  Circle, 
  FileText, 
  MessageSquare, 
  Scale, 
  Users,
  ArrowRight,
  Edit2,
  Save,
  X
} from 'lucide-react';

interface JourneyStepperProps {
  acasStatus: AcasStatus;
  className?: string;
}

interface StepConfig {
  key: JourneyStepKey;
  icon: React.ComponentType<{ className?: string }>;
  mandatory?: boolean;
  requiresCertificate?: boolean;
  certificateLabel?: string;
  certificatePattern?: RegExp;
}

const STEPS: StepConfig[] = [
  { key: 'incident', icon: AlertCircle },
  { 
    key: 'acas', 
    icon: MessageSquare, 
    mandatory: true,
    requiresCertificate: true,
    certificateLabel: 'journey.certificate.acas',
    certificatePattern: /^[A-Z]{1,2}\d{6}\/\d{2}\/\d{2}$/i, // e.g. R123456/01/23
  },
  { 
    key: 'et1', 
    icon: FileText,
    requiresCertificate: true,
    certificateLabel: 'journey.certificate.et1',
  },
  { key: 'et3', icon: FileText },
  { key: 'caseManagement', icon: Scale },
  { key: 'witness', icon: Users },
  { key: 'hearing', icon: Scale },
];

function getCurrentStep(acasStatus: AcasStatus, journeyProgress: Record<string, JourneyStepProgress | undefined>): number {
  // Find the first step that isn't completed
  for (let i = 0; i < STEPS.length; i++) {
    const stepProgress = journeyProgress[STEPS[i].key];
    if (!stepProgress?.completed) {
      return i;
    }
  }
  return STEPS.length - 1;
}

export function JourneyStepper({ acasStatus, className }: JourneyStepperProps) {
  const { caseState, updateCaseState } = useApp();
  const journeyProgress = caseState.journeyProgress || {};
  const currentStep = getCurrentStep(acasStatus, journeyProgress);
  
  const [editingStep, setEditingStep] = useState<JourneyStepKey | null>(null);
  const [certificateInput, setCertificateInput] = useState('');
  const [inputError, setInputError] = useState('');

  const handleMarkComplete = (stepKey: JourneyStepKey, step: StepConfig) => {
    if (step.requiresCertificate) {
      setEditingStep(stepKey);
      setCertificateInput(journeyProgress[stepKey]?.certificateNumber || '');
      setInputError('');
    } else {
      updateProgress(stepKey);
    }
  };

  const updateProgress = (stepKey: JourneyStepKey, certificateNumber?: string) => {
    const newProgress = {
      ...journeyProgress,
      [stepKey]: {
        completed: true,
        completedAt: new Date().toISOString(),
        ...(certificateNumber && { certificateNumber }),
      },
    };
    updateCaseState({ journeyProgress: newProgress });
  };

  const handleSaveCertificate = (step: StepConfig) => {
    if (!certificateInput.trim()) {
      setInputError(t('journey.certificate.required'));
      return;
    }
    
    if (step.certificatePattern && !step.certificatePattern.test(certificateInput.trim())) {
      setInputError(t('journey.certificate.invalidFormat'));
      return;
    }

    updateProgress(step.key, certificateInput.trim());
    setEditingStep(null);
    setCertificateInput('');
    setInputError('');
  };

  const handleCancelEdit = () => {
    setEditingStep(null);
    setCertificateInput('');
    setInputError('');
  };

  const handleUndoComplete = (stepKey: JourneyStepKey) => {
    const newProgress = { ...journeyProgress };
    delete newProgress[stepKey];
    updateCaseState({ journeyProgress: newProgress });
  };

  return (
    <div className={cn('space-y-4', className)} role="list" aria-label={t('journey.title')}>
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const stepProgress = journeyProgress[step.key];
        const isCompleted = stepProgress?.completed || false;
        const isCurrent = index === currentStep && !isCompleted;
        const isUpcoming = index > currentStep && !isCompleted;
        const isEditing = editingStep === step.key;
        const canComplete = index <= currentStep + 1; // Can only complete current or next step

        return (
          <div
            key={step.key}
            role="listitem"
            className={cn(
              'relative flex gap-4 p-4 rounded-lg border-2 transition-all',
              isCompleted && 'bg-status-ok-bg border-status-ok-border status-pattern-ok',
              isCurrent && 'bg-primary-light border-primary ring-2 ring-primary/20',
              isUpcoming && 'bg-muted/50 border-border'
            )}
          >
            {/* Step indicator */}
            <div 
              className={cn(
                'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                isCompleted && 'bg-status-ok text-primary-foreground',
                isCurrent && 'bg-primary text-primary-foreground animate-pulse-soft',
                isUpcoming && 'bg-muted text-muted-foreground'
              )}
              aria-hidden="true"
            >
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : isCurrent ? (
                <ArrowRight className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Icon className="h-4 w-4 text-foreground/70" aria-hidden="true" />
                <h3 className="font-semibold text-foreground">
                  {t(`journey.steps.${step.key}.title`)}
                </h3>
                {isCurrent && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                    {t('journey.youAreHere')}
                  </span>
                )}
                {step.mandatory && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-status-warning-bg text-status-warning border border-status-warning-border">
                    {t(`journey.steps.${step.key}.mandatory`)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(`journey.steps.${step.key}.description`)}
              </p>
              
              {/* Certificate display */}
              {isCompleted && stepProgress?.certificateNumber && (
                <div className="mt-2 p-2 bg-background/50 rounded border border-border text-sm">
                  <span className="text-muted-foreground">{t(step.certificateLabel || 'journey.certificate.number')}: </span>
                  <span className="font-mono font-medium">{stepProgress.certificateNumber}</span>
                </div>
              )}

              {/* Certificate input form */}
              {isEditing && (
                <div className="mt-3 space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t(step.certificateLabel || 'journey.certificate.number')}
                    <span className="text-destructive ml-1">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={certificateInput}
                      onChange={(e) => {
                        setCertificateInput(e.target.value);
                        setInputError('');
                      }}
                      placeholder={t('journey.certificate.placeholder')}
                      className={cn(inputError && 'border-destructive')}
                      aria-invalid={!!inputError}
                    />
                    <Button size="sm" onClick={() => handleSaveCertificate(step)}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {inputError && (
                    <p className="text-xs text-destructive">{inputError}</p>
                  )}
                  {step.key === 'acas' && (
                    <p className="text-xs text-muted-foreground">
                      {t('journey.certificate.acasHint')}
                    </p>
                  )}
                </div>
              )}

              {/* Completion status and actions */}
              {isCompleted && !isEditing && (
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-status-ok font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t('journey.completed')}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-xs h-6 px-2"
                    onClick={() => step.requiresCertificate ? setEditingStep(step.key) : handleUndoComplete(step.key)}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    {t('journey.edit')}
                  </Button>
                </div>
              )}

              {/* Mark complete button */}
              {!isCompleted && canComplete && !isEditing && step.key !== 'incident' && (
                <Button
                  size="sm"
                  variant={isCurrent ? 'default' : 'outline'}
                  className="mt-3"
                  onClick={() => handleMarkComplete(step.key, step)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t('journey.markComplete')}
                </Button>
              )}
            </div>

            {/* Connecting line */}
            {index < STEPS.length - 1 && (
              <div 
                className={cn(
                  'absolute left-9 top-full w-0.5 h-4 -translate-x-1/2',
                  isCompleted ? 'bg-status-ok' : 'bg-border'
                )}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
