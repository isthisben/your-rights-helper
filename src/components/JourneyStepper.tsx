import React from 'react';
import { t } from '@/lib/i18n';
import { AcasStatus } from '@/types/case';
import { cn } from '@/lib/utils';
import { 
  AlertCircle, 
  CheckCircle2, 
  Circle, 
  FileText, 
  MessageSquare, 
  Scale, 
  Users,
  ArrowRight
} from 'lucide-react';

interface JourneyStepperProps {
  acasStatus: AcasStatus;
  className?: string;
}

const STEPS = [
  { key: 'incident', icon: AlertCircle },
  { key: 'acas', icon: MessageSquare, mandatory: true },
  { key: 'et1', icon: FileText },
  { key: 'et3', icon: FileText },
  { key: 'caseManagement', icon: Scale },
  { key: 'witness', icon: Users },
  { key: 'hearing', icon: Scale },
];

function getCurrentStep(acasStatus: AcasStatus): number {
  switch (acasStatus) {
    case 'started':
      return 1; // At ACAS
    case 'not_started':
    case 'unknown':
    default:
      return 0; // At incident
  }
}

export function JourneyStepper({ acasStatus, className }: JourneyStepperProps) {
  const currentStep = getCurrentStep(acasStatus);

  return (
    <div className={cn('space-y-4', className)} role="list" aria-label={t('journey.title')}>
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isUpcoming = index > currentStep;

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
              {isCompleted && (
                <span className="text-xs text-status-ok font-medium flex items-center gap-1 mt-2">
                  <CheckCircle2 className="h-3 w-3" />
                  {t('journey.completed')}
                </span>
              )}
            </div>

            {/* Connecting line */}
            {index < STEPS.length - 1 && (
              <div 
                className={cn(
                  'absolute left-9 top-full w-0.5 h-4 -translate-x-1/2',
                  index < currentStep ? 'bg-status-ok' : 'bg-border'
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
