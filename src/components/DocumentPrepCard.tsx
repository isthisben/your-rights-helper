import React from 'react';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DOCUMENT_TEMPLATES, DocumentType, DocumentDraft } from '@/types/documents';
import { 
  FileText, 
  Calculator, 
  Clock, 
  ListChecks,
  Edit,
  Check,
  Plus
} from 'lucide-react';

interface DocumentPrepCardProps {
  drafts: Record<DocumentType, DocumentDraft | undefined>;
  onStartDocument: (type: DocumentType) => void;
  onEditDocument: (type: DocumentType) => void;
  className?: string;
}

const DOCUMENT_ICONS: Record<DocumentType, React.ComponentType<{ className?: string }>> = {
  witnessStatement: FileText,
  scheduleOfLoss: Calculator,
  chronology: Clock,
  listOfIssues: ListChecks,
};

export function DocumentPrepCard({ 
  drafts, 
  onStartDocument, 
  onEditDocument,
  className 
}: DocumentPrepCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('documents.prepTitle')}
        </CardTitle>
        <CardDescription>{t('documents.prepDescription')}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {DOCUMENT_TEMPLATES.map((template) => {
            const Icon = DOCUMENT_ICONS[template.type];
            const draft = drafts[template.type];
            const isCompleted = draft?.completed;
            const isDraft = draft && !draft.completed;

            return (
              <div
                key={template.type}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                  isCompleted && 'bg-status-ok-bg border-status-ok-border',
                  isDraft && 'bg-status-warning-bg border-status-warning-border',
                  !draft && 'bg-background border-border hover:border-primary/50'
                )}
              >
                <div className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                  isCompleted && 'bg-status-ok text-primary-foreground',
                  isDraft && 'bg-status-warning text-primary-foreground',
                  !draft && 'bg-muted text-muted-foreground'
                )}>
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{t(template.titleKey)}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {t(template.descriptionKey)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isCompleted && (
                    <Badge variant="outline" className="bg-status-ok-bg text-status-ok border-status-ok-border">
                      <Check className="h-3 w-3 mr-1" />
                      {t('documents.completed')}
                    </Badge>
                  )}
                  {isDraft && (
                    <Badge variant="outline" className="bg-status-warning-bg text-status-warning border-status-warning-border">
                      {t('documents.draft')}
                    </Badge>
                  )}

                  {draft ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditDocument(template.type)}
                      className="gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      {t('journey.edit')}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onStartDocument(template.type)}
                      className="gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      {t('documents.start')}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
