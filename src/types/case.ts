export type Scenario = 
  | 'fired' 
  | 'hourscut' 
  | 'jobchanged' 
  | 'bullying' 
  | 'adjustments' 
  | 'notsure';

export type AcasStatus = 'not_started' | 'started' | 'unknown';

export type JourneyStepKey = 'incident' | 'acas' | 'et1' | 'et3' | 'caseManagement' | 'witness' | 'hearing';

export interface JourneyStepProgress {
  completed: boolean;
  completedAt?: string; // ISO date
  certificateNumber?: string; // For ACAS certificate, ET1 case number, etc.
}

export type JourneyProgress = Partial<Record<JourneyStepKey, JourneyStepProgress>>;

export type TextSize = 'small' | 'medium' | 'large';

export type SpeechRate = 0.5 | 0.75 | 1.0 | 1.25 | 1.5;

export interface AccessibilitySettings {
  textSize: TextSize;
  highContrast: boolean;
  reduceMotion: boolean;
  dyslexiaFont: boolean;
  colorblindMode: boolean;
  speechRate: SpeechRate;
  autoReadMessages: boolean;
  useElevenLabs: boolean;
}

export interface CaseState {
  scenario: Scenario | null;
  incidentDate: string | null; // ISO date string
  incidentDateUnknown: boolean;
  acasStatus: AcasStatus;
  acasStartDate: string | null; // ISO date string
  language: string;
  accessibility: AccessibilitySettings;
  intakeCompleted: boolean;
  currentIntakeStep: number;
  journeyProgress: JourneyProgress;
}

export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  textSize: 'medium',
  highContrast: false,
  reduceMotion: false,
  dyslexiaFont: false,
  colorblindMode: false,
  speechRate: 1.0,
  autoReadMessages: false,
  useElevenLabs: true,
};

export const DEFAULT_CASE_STATE: CaseState = {
  scenario: null,
  incidentDate: null,
  incidentDateUnknown: false,
  acasStatus: 'not_started',
  acasStartDate: null,
  language: 'en-A2',
  accessibility: DEFAULT_ACCESSIBILITY,
  intakeCompleted: false,
  currentIntakeStep: 0,
  journeyProgress: {
    incident: { completed: true }, // Always completed since they started the app
  },
};
