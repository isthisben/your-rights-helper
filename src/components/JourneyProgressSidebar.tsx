import React from 'react';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { JourneyProgress, JourneyStepKey } from '@/types/case';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <motion.aside 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const, delay: 0.3 }}
      className={cn(
        "hidden lg:flex flex-col fixed right-6 top-28 w-60 bg-card/80 backdrop-blur-md border border-border/40 rounded-2xl p-5 shadow-soft",
        className
      )}
      aria-label={t('journey.progress.title')}
    >
      <h3 className="text-sm font-semibold text-foreground mb-4 tracking-tight">
        {t('journey.progress.title')}
      </h3>
      
      {/* Progress bar */}
      <div className="mb-5">
        <Progress value={progressPercent} className="h-2 rounded-full" />
        <p className="text-xs text-muted-foreground mt-2">
          {t('journey.progress.percent', { percent: progressPercent })}
        </p>
      </div>
      
      {/* Step indicators */}
      <div className="space-y-1.5">
        {JOURNEY_STEPS.map((step, index) => {
          const isCompleted = journeyProgress[step]?.completed;
          const isCurrent = index === currentStep && !isCompleted;
          
          return (
            <div 
              key={step}
              className={cn(
                "flex items-center gap-2.5 text-xs py-2 px-3 rounded-xl transition-all duration-200",
                isCompleted && "text-status-ok",
                isCurrent && "bg-primary/10 text-primary font-medium",
                !isCompleted && !isCurrent && "text-muted-foreground"
              )}
            >
              <div 
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200",
                  isCompleted && "bg-status-ok text-white",
                  isCurrent && "bg-primary text-primary-foreground",
                  !isCompleted && !isCurrent && "bg-secondary border border-border/60"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <span className="text-[10px] font-medium">{index + 1}</span>
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
      <div className="mt-5 pt-4 border-t border-border/40">
        <p className="text-xs text-muted-foreground">
          {t('journey.progress.completed', { 
            completed: completedSteps, 
            total: totalSteps 
          })}
        </p>
      </div>
    </motion.aside>
  );
}
