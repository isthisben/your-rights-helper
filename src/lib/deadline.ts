import { addMonths, subDays, differenceInDays, format, isValid, parseISO } from 'date-fns';

export type UrgencyLevel = 'ok' | 'warning' | 'urgent';

export interface DeadlineInfo {
  deadline: Date | null;
  daysLeft: number | null;
  urgency: UrgencyLevel;
  formattedDeadline: string | null;
}

/**
 * Calculate the tribunal deadline based on UK Employment Tribunal rules.
 * The deadline is typically 3 calendar months minus 1 day from the incident date.
 * 
 * Note: This is a simplified calculation. Real cases may have extensions
 * for ACAS Early Conciliation period.
 */
export function calculateDeadline(incidentDate: string | null): DeadlineInfo {
  if (!incidentDate) {
    return {
      deadline: null,
      daysLeft: null,
      urgency: 'warning',
      formattedDeadline: null,
    };
  }

  const date = parseISO(incidentDate);
  if (!isValid(date)) {
    return {
      deadline: null,
      daysLeft: null,
      urgency: 'warning',
      formattedDeadline: null,
    };
  }

  // 3 calendar months minus 1 day
  const deadline = subDays(addMonths(date, 3), 1);
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
