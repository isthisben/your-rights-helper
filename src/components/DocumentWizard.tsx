import React, { useState, useEffect } from 'react';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  DocumentTemplate, 
  DocumentDraft, 
  DOCUMENT_TEMPLATES,
  DocumentType 
} from '@/types/documents';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Download, 
  HelpCircle, 
  Save,
  FileText
} from 'lucide-react';

interface DocumentWizardProps {
  documentType: DocumentType;
  onComplete: (draft: DocumentDraft) => void;
  onCancel: () => void;
  onAskForHelp: (prompt: string) => void;
  existingDraft?: DocumentDraft;
}

export function DocumentWizard({ 
  documentType, 
  onComplete, 
  onCancel, 
  onAskForHelp,
  existingDraft 
}: DocumentWizardProps) {
  const template = DOCUMENT_TEMPLATES.find(t => t.type === documentType);
  
  if (!template) {
    return <div className="p-4 text-destructive">Template not found</div>;
  }

  const [currentSection, setCurrentSection] = useState(0);
  const [sections, setSections] = useState<Record<string, string>>(
    existingDraft?.sections || {}
  );

  const section = template.sections[currentSection];
  const totalSections = template.sections.length;
  const progress = ((currentSection + 1) / totalSections) * 100;

  const handleSectionChange = (value: string) => {
    setSections(prev => ({
      ...prev,
      [section.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    const draft: DocumentDraft = {
      type: documentType,
      sections,
      createdAt: existingDraft?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completed: true,
    };
    onComplete(draft);
  };

  const handleSaveDraft = () => {
    const draft: DocumentDraft = {
      type: documentType,
      sections,
      createdAt: existingDraft?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completed: false,
    };
    onComplete(draft);
  };

  const canProceed = !section.required || (sections[section.id]?.trim().length > 0);
  const isLastSection = currentSection === totalSections - 1;

  const handleDownload = () => {
    let content = `${t(template.titleKey)}\n${'='.repeat(40)}\n\n`;
    
    template.sections.forEach(sec => {
      content += `${t(sec.title)}\n${'-'.repeat(20)}\n`;
      content += `${sections[sec.id] || '(Not completed)'}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentType}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <FileText className="h-4 w-4" />
          <span>{t(template.titleKey)}</span>
        </div>
        <CardTitle className="flex items-center gap-2">
          {t(section.title)}
          {section.required && <span className="text-destructive">*</span>}
        </CardTitle>
        <CardDescription>{t(section.description)}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('documents.step', { current: currentSection + 1, total: totalSections })}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Text area */}
        <Textarea
          value={sections[section.id] || ''}
          onChange={(e) => handleSectionChange(e.target.value)}
          placeholder={t(section.placeholder)}
          className="min-h-[200px] resize-y"
          aria-label={t(section.title)}
        />

        {/* Help button */}
        {section.helpPrompt && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAskForHelp(section.helpPrompt!)}
            className="gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            {t('documents.askForHelp')}
          </Button>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="ghost"
              onClick={handleSaveDraft}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {t('documents.saveDraft')}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('intake.navigation.back')}
            </Button>

            {isLastSection ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleComplete}
                  disabled={!canProceed}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  {t('documents.complete')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t('documents.download')}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="gap-2"
              >
                {t('intake.navigation.next')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
