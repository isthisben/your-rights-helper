import React from 'react';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { JourneyProgress, JourneyStepKey } from '@/types/case';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';

interface JourneyProgressSidebarProps {
  journeyProgress: JourneyProgress;
  acasStatus: 'not_started' | 'started' | 'unknown';
  className?: string;
}

const JOURNEY_STEPS: JourneyStepKey[] = [
  'incident',
  'acas',
  'et1',
  'et3',
  'caseManagement',
  'witness',
  'hearing',
];

export function JourneyProgressSidebar({ 
  journeyProgress, 
  acasStatus, 
  className 
}: JourneyProgressSidebarProps) {
  const completedSteps = JOURNEY_STEPS.filter(
    step => journeyProgress[step]?.completed
  ).length;
  
  const totalSteps = JOURNEY_STEPS.length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);
  
  // Determine current step
  const getCurrentStep = (): number => {
    for (let i = JOURNEY_STEPS.length - 1; i >= 0; i--) {
      if (journeyProgress[JOURNEY_STEPS[i]]?.completed) {
        return Math.min(i + 1, JOURNEY_STEPS.length - 1);
      }
    }
    return 0;
  };
  
  const currentStep = getCurrentStep();

  return (
    <aside 
      className={cn(
        "hidden lg:flex flex-col fixed right-4 top-24 w-56 bg-card border border-border rounded-xl p-4 shadow-sm",
        className
      )}
      aria-label={t('journey.progress.title')}
    >
      <h3 className="text-sm font-semibold text-foreground mb-3">
        {t('journey.progress.title')}
      </h3>
      
      {/* Progress bar */}
      <div className="mb-4">
        <Progress value={progressPercent} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {t('journey.progress.percent', { percent: progressPercent })}
        </p>
      </div>
      
      {/* Step indicators */}
      <div className="space-y-2">
        {JOURNEY_STEPS.map((step, index) => {
          const isCompleted = journeyProgress[step]?.completed;
          const isCurrent = index === currentStep && !isCompleted;
          
          return (
            <div 
              key={step}
              className={cn(
                "flex items-center gap-2 text-xs py-1 px-2 rounded transition-colors",
                isCompleted && "text-status-ok",
                isCurrent && "bg-primary/10 text-primary font-medium",
                !isCompleted && !isCurrent && "text-muted-foreground"
              )}
            >
              <div 
                className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                  isCompleted && "bg-status-ok text-white",
                  isCurrent && "bg-primary text-primary-foreground",
                  !isCompleted && !isCurrent && "bg-muted border border-border"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <span className="text-[10px]">{index + 1}</span>
                )}
              </div>
              <span className="truncate">
                {t(`journey.steps.${step}.title`)}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {t('journey.progress.completed', { 
            completed: completedSteps, 
            total: totalSteps 
          })}
        </p>
      </div>
    </aside>
  );
}
