import React from 'react';
import { t } from '@/lib/i18n';
import { AcasStatus } from '@/types/case';
import { calculateDeadline, UrgencyLevel } from '@/lib/deadline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  AlertCircle,
  Info
} from 'lucide-react';

interface DeadlineCardProps {
  incidentDate: string | null;
  incidentDateUnknown: boolean;
  acasStatus: AcasStatus;
  acasStartDate?: string | null;
  className?: string;
}

function UrgencyIcon({ urgency }: { urgency: UrgencyLevel }) {
  switch (urgency) {
    case 'ok':
      return <CheckCircle2 className="h-6 w-6" />;
    case 'warning':
      return <AlertTriangle className="h-6 w-6" />;
    case 'urgent':
      return <AlertCircle className="h-6 w-6" />;
  }
}

export function DeadlineCard({ incidentDate, incidentDateUnknown, acasStatus, acasStartDate, className }: DeadlineCardProps) {
  const deadline = calculateDeadline(incidentDate, acasStatus, acasStartDate);
  
  const urgencyStyles = {
    ok: 'bg-status-ok-bg border-status-ok-border text-status-ok status-pattern-ok colorblind-pattern-ok',
    warning: 'bg-status-warning-bg border-status-warning-border text-status-warning status-pattern-warning colorblind-pattern-warning',
    urgent: 'bg-status-urgent-bg border-status-urgent-border text-status-urgent status-pattern-urgent colorblind-pattern-urgent',
  };

  return (
    <div 
      className={cn('rounded-2xl border border-border/60 overflow-hidden bg-card shadow-soft hover:shadow-soft-lg transition-all duration-300', className)}
      role="region"
      aria-label={t('deadline.title')}
    >
      {/* Header */}
      <div className="bg-card p-5 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="font-semibold text-lg tracking-tight">{t('deadline.title')}</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          {t('deadline.subtitle')}
        </p>
      </div>

      {/* Deadline display */}
      <div className="p-5">
        {incidentDate && deadline.deadline ? (
          <div className="space-y-5">
            {/* Urgency status */}
            <div 
              className={cn(
                'flex items-center gap-3.5 p-5 rounded-xl border-2',
                urgencyStyles[deadline.urgency]
              )}
              role="status"
              aria-live="polite"
            >
              <UrgencyIcon urgency={deadline.urgency} />
              <div>
                <span className={`font-semibold block status-indicator-${deadline.urgency}`}>
                  {deadline.urgency === 'ok' && t('deadline.statusOk')}
                  {deadline.urgency === 'warning' && t('deadline.statusWarning')}
                  {deadline.urgency === 'urgent' && t('deadline.statusUrgent')}
                </span>
                <span className="text-sm">
                  {t('deadline.daysLeft', { days: deadline.daysLeft ?? 0 })}
                </span>
              </div>
            </div>

            {/* Date display */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-foreground">
                <Calendar className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm">{t('deadline.limitLabel')}:</span>
                <strong className="text-lg font-semibold">{deadline.formattedDeadline}</strong>
              </div>
              {deadline.includesAcasExtension && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-3 w-3" />
                  {t('deadline.acasExtension')}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-5 bg-secondary/50 rounded-xl">
            <div className="flex items-start gap-3.5">
              <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-foreground font-medium">{t('deadline.unknownDate')}</p>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{t('deadline.findDate')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Next action */}
        <div className="mt-5 p-5 bg-primary/5 rounded-xl border border-primary/10">
          <h3 className="font-medium text-foreground mb-2.5">
            {acasStatus === 'not_started' || acasStatus === 'unknown' 
              ? t('deadline.nextAction.startAcas')
              : t('deadline.nextAction.acasStarted')
            }
          </h3>
          {(acasStatus === 'not_started' || acasStatus === 'unknown') && (
            <Button 
              variant="default" 
              size="lg" 
              className="w-full sm:w-auto mt-2"
              onClick={() => window.open('https://www.acas.org.uk/early-conciliation', '_blank')}
            >
              Start ACAS
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground mt-5 flex items-start gap-2.5 leading-relaxed">
          <Info className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {t('deadline.disclaimer')}
        </p>
      </div>
    </div>
  );
}
