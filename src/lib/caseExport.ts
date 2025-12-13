import { CaseState } from '@/types/case';
import { DOCUMENT_TEMPLATES } from '@/types/documents';
import { t } from '@/lib/i18n';
import { format } from 'date-fns';

/**
 * Generates a comprehensive text file containing all case details
 */
export function generateCaseDetailsText(caseState: CaseState): string {
  let content = '';
  
  // Header
  content += '='.repeat(60) + '\n';
  content += 'WORK RIGHTS NAVIGATOR - CASE DETAILS\n';
  content += '='.repeat(60) + '\n';
  content += `Generated: ${format(new Date(), 'dd MMMM yyyy, HH:mm')}\n\n`;
  
  // Basic Information
  content += 'BASIC INFORMATION\n';
  content += '-'.repeat(60) + '\n';
  
  if (caseState.scenario) {
    const scenarioLabels: Record<string, string> = {
      fired: t('intake.step1.options.fired'),
      hourscut: t('intake.step1.options.hourscut'),
      jobchanged: t('intake.step1.options.jobchanged'),
      bullying: t('intake.step1.options.bullying'),
      adjustments: t('intake.step1.options.adjustments'),
      notsure: t('intake.step1.options.notsure'),
    };
    content += `Situation: ${scenarioLabels[caseState.scenario] || caseState.scenario}\n`;
  } else {
    content += 'Situation: Not specified\n';
  }
  
  if (caseState.incidentDate) {
    try {
      const date = new Date(caseState.incidentDate);
      content += `Incident Date: ${format(date, 'dd MMMM yyyy')}\n`;
    } catch {
      content += `Incident Date: ${caseState.incidentDate}\n`;
    }
  } else if (caseState.incidentDateUnknown) {
    content += 'Incident Date: Unknown\n';
  } else {
    content += 'Incident Date: Not provided\n';
  }
  
  // ACAS Information
  content += '\nACAS EARLY CONCILIATION\n';
  content += '-'.repeat(60) + '\n';
  
  const acasStatusLabels: Record<string, string> = {
    not_started: 'Not started',
    started: 'Started',
    unknown: 'Unknown',
  };
  content += `Status: ${acasStatusLabels[caseState.acasStatus] || caseState.acasStatus}\n`;
  
  if (caseState.acasStartDate) {
    try {
      const date = new Date(caseState.acasStartDate);
      content += `Start Date: ${format(date, 'dd MMMM yyyy')}\n`;
    } catch {
      content += `Start Date: ${caseState.acasStartDate}\n`;
    }
  }
  
  // Journey Progress
  content += '\nJOURNEY PROGRESS\n';
  content += '-'.repeat(60) + '\n';
  
  const journeySteps = [
    { key: 'incident', label: 'Incident' },
    { key: 'acas', label: 'ACAS Early Conciliation' },
    { key: 'et1', label: 'ET1 Form Submission' },
    { key: 'et3', label: 'ET3 Response' },
    { key: 'caseManagement', label: 'Case Management' },
    { key: 'witness', label: 'Witness Statements' },
    { key: 'hearing', label: 'Hearing' },
  ];
  
  journeySteps.forEach(step => {
    const progress = caseState.journeyProgress[step.key as keyof typeof caseState.journeyProgress];
    if (progress) {
      content += `${step.label}: ${progress.completed ? 'Completed' : 'In Progress'}\n`;
      if (progress.completedAt) {
        try {
          const date = new Date(progress.completedAt);
          content += `  Completed: ${format(date, 'dd MMMM yyyy')}\n`;
        } catch {
          content += `  Completed: ${progress.completedAt}\n`;
        }
      }
      if (progress.certificateNumber) {
        content += `  Reference Number: ${progress.certificateNumber}\n`;
      }
    } else {
      content += `${step.label}: Not started\n`;
    }
  });
  
  // Legal Advisor
  if (caseState.legalAdvisor) {
    content += '\nLEGAL ADVISOR CONTACT\n';
    content += '-'.repeat(60) + '\n';
    if (caseState.legalAdvisor.name) {
      content += `Name: ${caseState.legalAdvisor.name}\n`;
    }
    if (caseState.legalAdvisor.phone) {
      content += `Phone: ${caseState.legalAdvisor.phone}\n`;
    }
    if (caseState.legalAdvisor.email) {
      content += `Email: ${caseState.legalAdvisor.email}\n`;
    }
  }
  
  // Documents
  content += '\nDOCUMENTS PREPARED\n';
  content += '-'.repeat(60) + '\n';
  
  const documentDrafts = caseState.documentDrafts || {};
  let hasDocuments = false;
  
  DOCUMENT_TEMPLATES.forEach(template => {
    const draft = documentDrafts[template.type];
    if (draft) {
      hasDocuments = true;
      content += `\n${t(template.titleKey).toUpperCase()}\n`;
      content += '─'.repeat(40) + '\n';
      content += `Status: ${draft.completed ? 'Completed' : 'Draft'}\n`;
      if (draft.createdAt) {
        try {
          const date = new Date(draft.createdAt);
          content += `Created: ${format(date, 'dd MMMM yyyy')}\n`;
        } catch {
          content += `Created: ${draft.createdAt}\n`;
        }
      }
      if (draft.updatedAt) {
        try {
          const date = new Date(draft.updatedAt);
          content += `Last Updated: ${format(date, 'dd MMMM yyyy')}\n`;
        } catch {
          content += `Last Updated: ${draft.updatedAt}\n`;
        }
      }
      
      // Document sections
      template.sections.forEach(section => {
        const sectionContent = draft.sections[section.id];
        if (sectionContent) {
          content += `\n${t(section.title)}:\n`;
          content += sectionContent.split('\n').map(line => `  ${line}`).join('\n') + '\n';
        }
      });
    }
  });
  
  if (!hasDocuments) {
    content += 'No documents have been prepared yet.\n';
  }
  
  // Footer
  content += '\n' + '='.repeat(60) + '\n';
  content += 'END OF CASE DETAILS\n';
  content += '='.repeat(60) + '\n';
  
  return content;
}

/**
 * Downloads the case details as a text file
 */
export function downloadCaseDetails(caseState: CaseState): void {
  const content = generateCaseDetailsText(caseState);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `case-details-${format(new Date(), 'yyyy-MM-dd')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Sends case details to legal advisor via email (opens mailto link)
 */
export function sendCaseDetailsToLegalAdvisor(caseState: CaseState): void {
  if (!caseState.legalAdvisor?.email) {
    throw new Error('Legal advisor email is not set');
  }
  
  const content = generateCaseDetailsText(caseState);
  const subject = encodeURIComponent('Case Details - Work Rights Navigator');
  const body = encodeURIComponent(content);
  const email = caseState.legalAdvisor.email;
  
  const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
  window.location.href = mailtoLink;
}

