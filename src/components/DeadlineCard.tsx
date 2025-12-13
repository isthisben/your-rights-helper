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

export function DeadlineCard({ incidentDate, incidentDateUnknown, acasStatus, className }: DeadlineCardProps) {
  const deadline = calculateDeadline(incidentDate);
  
  const urgencyStyles = {
    ok: 'bg-status-ok-bg border-status-ok-border text-status-ok status-pattern-ok',
    warning: 'bg-status-warning-bg border-status-warning-border text-status-warning status-pattern-warning',
    urgent: 'bg-status-urgent-bg border-status-urgent-border text-status-urgent status-pattern-urgent',
  };

  return (
    <div 
      className={cn('rounded-xl border-2 overflow-hidden', className)}
      role="region"
      aria-label={t('deadline.title')}
    >
      {/* Header */}
      <div className="bg-card p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="font-semibold text-lg">{t('deadline.title')}</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {t('deadline.subtitle')}
        </p>
      </div>

      {/* Deadline display */}
      <div className="p-4">
        {incidentDate && deadline.deadline ? (
          <div className="space-y-4">
            {/* Urgency status */}
            <div 
              className={cn(
                'flex items-center gap-3 p-4 rounded-lg border-2',
                urgencyStyles[deadline.urgency]
              )}
              role="status"
              aria-live="polite"
            >
              <UrgencyIcon urgency={deadline.urgency} />
              <div>
                <span className="font-semibold block">
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
            <div className="flex items-center gap-2 text-foreground">
              <Calendar className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm">{t('deadline.limitLabel')}:</span>
              <strong className="text-lg">{deadline.formattedDeadline}</strong>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-foreground font-medium">{t('deadline.unknownDate')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('deadline.findDate')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Next action */}
        <div className="mt-4 p-4 bg-primary-light rounded-lg">
          <h3 className="font-medium text-foreground mb-2">
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
        <p className="text-xs text-muted-foreground mt-4 flex items-start gap-2">
          <Info className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {t('deadline.disclaimer')}
        </p>
      </div>
    </div>
  );
}
