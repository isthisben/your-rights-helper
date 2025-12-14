import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { AcasStatus, JourneyStepKey, JourneyStepProgress } from '@/types/case';
import { STEP_CHECKLISTS } from '@/types/documents';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StepChecklist } from '@/components/StepChecklist';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  CheckCircle2, 
  Circle, 
  FileText, 
  MessageSquare, 
  Scale, 
  Users,
  ArrowRight,
  ArrowLeft,
  Edit2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  PlayCircle
} from 'lucide-react';

interface JourneyStepperProps {
  acasStatus: AcasStatus;
  onAskForHelp?: (prompt: string) => void;
  className?: string;
}

interface StepConfig {
  key: JourneyStepKey;
  icon: React.ComponentType<{ className?: string }>;
  mandatory?: boolean;
  requiresCertificate?: boolean;
  certificateLabel?: string;
  certificatePattern?: RegExp;
  hasChecklist?: boolean;
}

const STEPS: StepConfig[] = [
  { key: 'incident', icon: AlertCircle },
  { 
    key: 'acas', 
    icon: MessageSquare, 
    mandatory: true,
    requiresCertificate: true,
    certificateLabel: 'journey.certificate.acas',
    certificatePattern: /^[A-Z]{1,2}\d{6}\/\d{2}\/\d{2}$/i,
  },
  { 
    key: 'et1', 
    icon: FileText,
    requiresCertificate: true,
    certificateLabel: 'journey.certificate.et1',
    hasChecklist: true,
  },
  { key: 'et3', icon: FileText, hasChecklist: true },
  { key: 'caseManagement', icon: Scale, hasChecklist: true },
  { key: 'witness', icon: Users, hasChecklist: true },
  { key: 'hearing', icon: Scale, hasChecklist: true },
];

function getCurrentStep(acasStatus: AcasStatus, journeyProgress: Record<string, JourneyStepProgress | undefined>): number {
  for (let i = 0; i < STEPS.length; i++) {
    const stepProgress = journeyProgress[STEPS[i].key];
    if (!stepProgress?.completed) {
      return i;
    }
  }
  return STEPS.length - 1;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

export function JourneyStepper({ acasStatus, onAskForHelp, className }: JourneyStepperProps) {
  const { caseState, updateCaseState } = useApp();
  const navigate = useNavigate();
  const journeyProgress = caseState.journeyProgress || {};
  const currentJourneyStep = getCurrentStep(acasStatus, journeyProgress);
  
  const [viewingStep, setViewingStep] = useState(currentJourneyStep);
  const [direction, setDirection] = useState(0);
  const [editingStep, setEditingStep] = useState<JourneyStepKey | null>(null);
  const [certificateInput, setCertificateInput] = useState('');
  const [inputError, setInputError] = useState('');

  // Check if user left intake midway or completed it
  const intakeInProgress = !caseState.intakeCompleted && caseState.currentIntakeStep > 0;
  const intakeCompleted = caseState.intakeCompleted;

  const navigateStep = (newStep: number) => {
    if (newStep >= 0 && newStep < STEPS.length) {
      setDirection(newStep > viewingStep ? 1 : -1);
      setViewingStep(newStep);
    }
  };

  const handleMarkComplete = (stepKey: JourneyStepKey, step: StepConfig) => {
    if (step.requiresCertificate) {
      setEditingStep(stepKey);
      setCertificateInput(journeyProgress[stepKey]?.certificateNumber || '');
      setInputError('');
    } else {
      updateProgress(stepKey);
    }
  };

  const updateProgress = (stepKey: JourneyStepKey, certificateNumber?: string) => {
    const existingProgress = journeyProgress[stepKey];
    const newProgress = {
      ...journeyProgress,
      [stepKey]: {
        ...existingProgress,
        completed: true,
        completedAt: new Date().toISOString(),
        ...(certificateNumber && { certificateNumber }),
      },
    };
    updateCaseState({ journeyProgress: newProgress });
  };

  const handleSaveCertificate = (step: StepConfig) => {
    if (!certificateInput.trim()) {
      setInputError(t('journey.certificate.required'));
      return;
    }
    
    if (step.certificatePattern && !step.certificatePattern.test(certificateInput.trim())) {
      setInputError(t('journey.certificate.invalidFormat'));
      return;
    }

    updateProgress(step.key, certificateInput.trim());
    setEditingStep(null);
    setCertificateInput('');
    setInputError('');
  };

  const handleCancelEdit = () => {
    setEditingStep(null);
    setCertificateInput('');
    setInputError('');
  };

  const handleUndoComplete = (stepKey: JourneyStepKey) => {
    const newProgress = { ...journeyProgress };
    delete newProgress[stepKey];
    updateCaseState({ journeyProgress: newProgress });
  };

  const handleChecklistToggle = (stepKey: JourneyStepKey, itemId: string, checked: boolean) => {
    const existingProgress = journeyProgress[stepKey] || { completed: false };
    const existingItems = existingProgress.checklistItems || [];
    
    const newItems = checked 
      ? [...existingItems, itemId]
      : existingItems.filter(id => id !== itemId);
    
    const newProgress = {
      ...journeyProgress,
      [stepKey]: {
        ...existingProgress,
        checklistItems: newItems,
      },
    };
    updateCaseState({ journeyProgress: newProgress });
  };

  const handleAskForHelp = (prompt: string) => {
    if (onAskForHelp) {
      onAskForHelp(prompt);
    }
  };

  // Navigate to intake - either continue where left off or go to review step
  const handleContinueIntake = () => {
    navigate('/intake');
  };

  const handleEditIntake = () => {
    // Go directly to the review/summary step (step 4)
    updateCaseState({ currentIntakeStep: 4 });
    navigate('/intake');
  };

  const step = STEPS[viewingStep];
  const Icon = step.icon;
  const stepProgress = journeyProgress[step.key];
  const isCompleted = stepProgress?.completed || false;
  const isCurrent = viewingStep === currentJourneyStep && !isCompleted;
  const isEditing = editingStep === step.key;
  const canComplete = viewingStep <= currentJourneyStep + 1;
  const hasChecklist = step.hasChecklist && STEP_CHECKLISTS[step.key];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step Progress Dots */}
      <div className="flex items-center justify-center gap-2 pb-2">
        {STEPS.map((s, index) => {
          const sProgress = journeyProgress[s.key];
          const sCompleted = sProgress?.completed || false;
          const sCurrent = index === currentJourneyStep && !sCompleted;
          const isViewing = index === viewingStep;
          
          return (
            <button
              key={s.key}
              onClick={() => navigateStep(index)}
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-300 ease-out-expo',
                sCompleted && 'bg-status-ok',
                sCurrent && 'bg-primary',
                !sCompleted && !sCurrent && 'bg-muted',
                isViewing && 'ring-2 ring-offset-2 ring-primary/50 scale-125'
              )}
              aria-label={t(`journey.steps.${s.key}.title`)}
            />
          );
        })}
      </div>

      {/* Step Counter */}
      <div className="text-center text-sm text-muted-foreground">
        {t('journey.stepOf', { current: viewingStep + 1, total: STEPS.length })}
      </div>

      {/* Current Step Card */}
      <div className="relative overflow-hidden min-h-[320px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={viewingStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className={cn(
              'rounded-2xl border-2 p-6 transition-colors shadow-soft',
              isCompleted && 'bg-status-ok-bg border-status-ok-border',
              isCurrent && 'bg-accent/30 border-primary',
              !isCompleted && !isCurrent && 'bg-card border-border/60'
            )}
          >
            {/* Step Header */}
            <div className="flex items-start gap-4 mb-6">
              <div 
                className={cn(
                  'flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center',
                  isCompleted && 'bg-status-ok text-primary-foreground',
                  isCurrent && 'bg-primary text-primary-foreground',
                  !isCompleted && !isCurrent && 'bg-secondary text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-7 w-7" />
                ) : (
                  <Icon className="h-7 w-7" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-xl text-foreground tracking-tight">
                    {t(`journey.steps.${step.key}.title`)}
                  </h3>
                  {isCurrent && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                      {t('journey.youAreHere')}
                    </span>
                  )}
                </div>
                {step.mandatory && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                    {t(`journey.steps.${step.key}.mandatory`)}
                  </span>
                )}
              </div>
            </div>

            {/* Step Description */}
            <p className="text-muted-foreground leading-relaxed mb-6">
              {t(`journey.steps.${step.key}.description`)}
            </p>

            {/* Certificate display */}
            {isCompleted && stepProgress?.certificateNumber && (
              <div className="mb-4 p-4 bg-card/80 rounded-xl border border-border/60">
                <span className="text-sm text-muted-foreground">{t(step.certificateLabel || 'journey.certificate.number')}: </span>
                <span className="font-mono font-semibold text-foreground">{stepProgress.certificateNumber}</span>
              </div>
            )}

            {/* Certificate input form */}
            {isEditing && (
              <div className="mb-4 space-y-3 p-4 bg-card/80 rounded-xl border border-border/60">
                <label className="text-sm font-medium text-foreground">
                  {t(step.certificateLabel || 'journey.certificate.number')}
                  <span className="text-destructive ml-1">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    value={certificateInput}
                    onChange={(e) => {
                      setCertificateInput(e.target.value);
                      setInputError('');
                    }}
                    placeholder={t('journey.certificate.placeholder')}
                    className={cn(inputError && 'border-destructive')}
                    aria-invalid={!!inputError}
                  />
                  <Button size="icon" onClick={() => handleSaveCertificate(step)}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {inputError && (
                  <p className="text-xs text-destructive">{inputError}</p>
                )}
                {step.key === 'acas' && (
                  <p className="text-xs text-muted-foreground">
                    {t('journey.certificate.acasHint')}
                  </p>
                )}
              </div>
            )}

            {/* Completion status and actions */}
            {isCompleted && !isEditing && (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-status-ok font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('journey.completed')}
                </span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs"
                  onClick={() => step.requiresCertificate ? setEditingStep(step.key) : handleUndoComplete(step.key)}
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  {t('journey.edit')}
                </Button>
              </div>
            )}

            {/* Mark complete button */}
            {!isCompleted && canComplete && !isEditing && step.key !== 'incident' && (
              <Button
                size="lg"
                variant={isCurrent ? 'default' : 'outline'}
                className="w-full mb-4"
                onClick={() => handleMarkComplete(step.key, step)}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                {t('journey.markComplete')}
              </Button>
            )}

            {/* Incident step - Continue or Edit intake buttons */}
            {step.key === 'incident' && (
              <div className="mb-4">
                {intakeInProgress ? (
                  <Button
                    size="lg"
                    variant="default"
                    className="w-full"
                    onClick={handleContinueIntake}
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    {t('journey.continueIntake') || 'Continue where you left off'}
                  </Button>
                ) : intakeCompleted ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    onClick={handleEditIntake}
                  >
                    <Edit2 className="h-5 w-5 mr-2" />
                    {t('journey.editIntake') || 'Edit your details'}
                  </Button>
                ) : null}
              </div>
            )}

            {/* Checklist */}
            {hasChecklist && (isCurrent || isCompleted || viewingStep === currentJourneyStep + 1) && (
              <div className="pt-4 border-t border-border/40">
                <StepChecklist
                  stepKey={step.key}
                  completedItems={stepProgress?.checklistItems || []}
                  onToggleItem={(itemId, checked) => handleChecklistToggle(step.key, itemId, checked)}
                  onAskForHelp={handleAskForHelp}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigateStep(viewingStep - 1)}
          disabled={viewingStep === 0}
          className="flex-1"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          {t('journey.previous')}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigateStep(viewingStep + 1)}
          disabled={viewingStep === STEPS.length - 1}
          className="flex-1"
        >
          {t('journey.next')}
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}