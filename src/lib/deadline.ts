import { addMonths, subDays, differenceInDays, format, isValid, parseISO, addDays } from 'date-fns';
import { AcasStatus } from '@/types/case';

export type UrgencyLevel = 'ok' | 'warning' | 'urgent';

export interface DeadlineInfo {
  deadline: Date | null;
  daysLeft: number | null;
  urgency: UrgencyLevel;
  formattedDeadline: string | null;
  includesAcasExtension: boolean;
}

/**
 * Calculate the tribunal deadline based on UK Employment Tribunal rules.
 * 
 * Base deadline: 3 calendar months minus 1 day from the incident date.
 * 
 * ACAS Early Conciliation Extension:
 * - If ACAS Early Conciliation was started, the deadline is extended by the period
 *   between the incident date and when ACAS was contacted (up to a maximum extension)
 * - The extension period is typically the number of days from incident to ACAS start
 * - Maximum extension is typically 1 month (30 days) as per UK Employment Tribunal rules
 */
export function calculateDeadline(
  incidentDate: string | null,
  acasStatus: AcasStatus = 'not_started',
  acasStartDate: string | null = null
): DeadlineInfo {
  if (!incidentDate) {
    return {
      deadline: null,
      daysLeft: null,
      urgency: 'warning',
      formattedDeadline: null,
      includesAcasExtension: false,
    };
  }

  const date = parseISO(incidentDate);
  if (!isValid(date)) {
    return {
      deadline: null,
      daysLeft: null,
      urgency: 'warning',
      formattedDeadline: null,
      includesAcasExtension: false,
    };
  }

  // Base deadline: 3 calendar months minus 1 day
  let deadline = subDays(addMonths(date, 3), 1);
  let includesAcasExtension = false;

  // Apply ACAS Early Conciliation extension if applicable
  if (acasStatus === 'started' && acasStartDate) {
    const acasDate = parseISO(acasStartDate);
    if (isValid(acasDate) && acasDate >= date) {
      // Calculate days between incident and ACAS start
      const extensionDays = differenceInDays(acasDate, date);
      // Maximum extension is 30 days (1 month) as per UK Employment Tribunal rules
      const actualExtension = Math.min(extensionDays, 30);
      
      if (actualExtension > 0) {
        deadline = addDays(deadline, actualExtension);
        includesAcasExtension = true;
      }
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysLeft = differenceInDays(deadline, today);
  
  let urgency: UrgencyLevel;
  if (daysLeft <= 7) {
    urgency = 'urgent';
  } else if (daysLeft <= 21) {
    urgency = 'warning';
  } else {
    urgency = 'ok';
  }

  return {
    deadline,
    daysLeft: Math.max(0, daysLeft),
    urgency,
    formattedDeadline: format(deadline, 'd MMMM yyyy'),
    includesAcasExtension,
  };
}

export function getUrgencyLabel(urgency: UrgencyLevel, t: (key: string) => string): string {
  switch (urgency) {
    case 'ok':
      return t('deadline.statusOk');
    case 'warning':
      return t('deadline.statusWarning');
    case 'urgent':
      return t('deadline.statusUrgent');
  }
}
