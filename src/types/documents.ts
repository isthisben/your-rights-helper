export type DocumentType = 'witnessStatement' | 'scheduleOfLoss' | 'chronology' | 'listOfIssues';

export interface DocumentSection {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  required: boolean;
  helpPrompt?: string; // Chatbot prompt for help
}

export interface DocumentTemplate {
  type: DocumentType;
  titleKey: string;
  descriptionKey: string;
  sections: DocumentSection[];
}

export interface DocumentDraft {
  type: DocumentType;
  sections: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
}

export interface StepChecklist {
  stepKey: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  labelKey: string;
  helpPrompt?: string;
  externalLink?: string;
  externalLinkLabel?: string;
}

// Document templates configuration
export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    type: 'witnessStatement',
    titleKey: 'documents.witnessStatement.title',
    descriptionKey: 'documents.witnessStatement.description',
    sections: [
      {
        id: 'introduction',
        title: 'documents.witnessStatement.sections.introduction.title',
        description: 'documents.witnessStatement.sections.introduction.description',
        placeholder: 'documents.witnessStatement.sections.introduction.placeholder',
        required: true,
        helpPrompt: 'What should I write in my witness statement introduction?',
      },
      {
        id: 'background',
        title: 'documents.witnessStatement.sections.background.title',
        description: 'documents.witnessStatement.sections.background.description',
        placeholder: 'documents.witnessStatement.sections.background.placeholder',
        required: true,
        helpPrompt: 'What background information should I include in my witness statement?',
      },
      {
        id: 'events',
        title: 'documents.witnessStatement.sections.events.title',
        description: 'documents.witnessStatement.sections.events.description',
        placeholder: 'documents.witnessStatement.sections.events.placeholder',
        required: true,
        helpPrompt: 'How should I describe what happened in my witness statement?',
      },
      {
        id: 'impact',
        title: 'documents.witnessStatement.sections.impact.title',
        description: 'documents.witnessStatement.sections.impact.description',
        placeholder: 'documents.witnessStatement.sections.impact.placeholder',
        required: true,
        helpPrompt: 'How do I explain the impact of what happened to me?',
      },
      {
        id: 'conclusion',
        title: 'documents.witnessStatement.sections.conclusion.title',
        description: 'documents.witnessStatement.sections.conclusion.description',
        placeholder: 'documents.witnessStatement.sections.conclusion.placeholder',
        required: true,
        helpPrompt: 'How should I end my witness statement?',
      },
    ],
  },
  {
    type: 'scheduleOfLoss',
    titleKey: 'documents.scheduleOfLoss.title',
    descriptionKey: 'documents.scheduleOfLoss.description',
    sections: [
      {
        id: 'pastLoss',
        title: 'documents.scheduleOfLoss.sections.pastLoss.title',
        description: 'documents.scheduleOfLoss.sections.pastLoss.description',
        placeholder: 'documents.scheduleOfLoss.sections.pastLoss.placeholder',
        required: true,
        helpPrompt: 'What past losses can I claim in my schedule of loss?',
      },
      {
        id: 'futureLoss',
        title: 'documents.scheduleOfLoss.sections.futureLoss.title',
        description: 'documents.scheduleOfLoss.sections.futureLoss.description',
        placeholder: 'documents.scheduleOfLoss.sections.futureLoss.placeholder',
        required: false,
        helpPrompt: 'How do I calculate future losses for my tribunal claim?',
      },
      {
        id: 'benefits',
        title: 'documents.scheduleOfLoss.sections.benefits.title',
        description: 'documents.scheduleOfLoss.sections.benefits.description',
        placeholder: 'documents.scheduleOfLoss.sections.benefits.placeholder',
        required: false,
        helpPrompt: 'What benefits did I lose that I can include?',
      },
      {
        id: 'injury',
        title: 'documents.scheduleOfLoss.sections.injury.title',
        description: 'documents.scheduleOfLoss.sections.injury.description',
        placeholder: 'documents.scheduleOfLoss.sections.injury.placeholder',
        required: false,
        helpPrompt: 'Can I claim for injury to feelings in my schedule of loss?',
      },
    ],
  },
  {
    type: 'chronology',
    titleKey: 'documents.chronology.title',
    descriptionKey: 'documents.chronology.description',
    sections: [
      {
        id: 'events',
        title: 'documents.chronology.sections.events.title',
        description: 'documents.chronology.sections.events.description',
        placeholder: 'documents.chronology.sections.events.placeholder',
        required: true,
        helpPrompt: 'How do I create a chronology for my tribunal case?',
      },
    ],
  },
  {
    type: 'listOfIssues',
    titleKey: 'documents.listOfIssues.title',
    descriptionKey: 'documents.listOfIssues.description',
    sections: [
      {
        id: 'claims',
        title: 'documents.listOfIssues.sections.claims.title',
        description: 'documents.listOfIssues.sections.claims.description',
        placeholder: 'documents.listOfIssues.sections.claims.placeholder',
        required: true,
        helpPrompt: 'What should I include in my list of issues?',
      },
    ],
  },
];

// Step checklists configuration
export const STEP_CHECKLISTS: Record<string, ChecklistItem[]> = {
  et1: [
    {
      id: 'et1-acas-cert',
      labelKey: 'checklists.et1.acasCert',
      helpPrompt: 'Where do I find my ACAS certificate number?',
    },
    {
      id: 'et1-details',
      labelKey: 'checklists.et1.personalDetails',
    },
    {
      id: 'et1-employer',
      labelKey: 'checklists.et1.employerDetails',
      helpPrompt: 'What employer details do I need for ET1?',
    },
    {
      id: 'et1-claim',
      labelKey: 'checklists.et1.claimDetails',
      helpPrompt: 'How do I describe my claim on the ET1 form?',
    },
    {
      id: 'et1-submit',
      labelKey: 'checklists.et1.submit',
      externalLink: 'https://www.gov.uk/employment-tribunals/make-a-claim',
      externalLinkLabel: 'checklists.et1.submitLink',
    },
  ],
  et3: [
    {
      id: 'et3-received',
      labelKey: 'checklists.et3.received',
      helpPrompt: 'What happens after the employer responds with ET3?',
    },
    {
      id: 'et3-review',
      labelKey: 'checklists.et3.review',
      helpPrompt: 'How do I respond to what my employer said in their ET3?',
    },
  ],
  caseManagement: [
    {
      id: 'cm-orders',
      labelKey: 'checklists.caseManagement.readOrders',
      helpPrompt: 'What are case management orders and what do I need to do?',
    },
    {
      id: 'cm-deadlines',
      labelKey: 'checklists.caseManagement.noteDeadlines',
    },
    {
      id: 'cm-documents',
      labelKey: 'checklists.caseManagement.gatherDocuments',
      helpPrompt: 'What documents do I need to gather for my case?',
    },
  ],
  witness: [
    {
      id: 'wit-statement',
      labelKey: 'checklists.witness.writeStatement',
      helpPrompt: 'How do I write a good witness statement?',
    },
    {
      id: 'wit-others',
      labelKey: 'checklists.witness.getOthers',
      helpPrompt: 'Can other people write witness statements for my case?',
    },
    {
      id: 'wit-bundle',
      labelKey: 'checklists.witness.prepareBundle',
      helpPrompt: 'What is a bundle and how do I prepare one?',
    },
    {
      id: 'wit-schedule',
      labelKey: 'checklists.witness.scheduleOfLoss',
      helpPrompt: 'What is a schedule of loss and how do I create one?',
    },
  ],
  hearing: [
    {
      id: 'hr-prepare',
      labelKey: 'checklists.hearing.prepare',
      helpPrompt: 'How do I prepare for my tribunal hearing?',
    },
    {
      id: 'hr-travel',
      labelKey: 'checklists.hearing.travel',
    },
    {
      id: 'hr-dress',
      labelKey: 'checklists.hearing.dress',
      helpPrompt: 'What should I wear to a tribunal hearing?',
    },
    {
      id: 'hr-documents',
      labelKey: 'checklists.hearing.bringDocuments',
    },
  ],
};
