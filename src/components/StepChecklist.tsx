import React from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { STEP_CHECKLISTS, ChecklistItem } from '@/types/documents';
import { JourneyStepKey } from '@/types/case';
import { ExternalLink, HelpCircle } from 'lucide-react';

interface StepChecklistProps {
  stepKey: JourneyStepKey;
  completedItems: string[];
  onToggleItem: (itemId: string, checked: boolean) => void;
  onAskForHelp: (prompt: string) => void;
  className?: string;
}

export function StepChecklist({ 
  stepKey, 
  completedItems, 
  onToggleItem, 
  onAskForHelp,
  className 
}: StepChecklistProps) {
  const navigate = useNavigate();
  const items = STEP_CHECKLISTS[stepKey];
  
  if (!items || items.length === 0) {
    return null;
  }

  const handleHelpClick = (helpPrompt?: string) => {
    // Navigate to FAQ page
    navigate('/faq');
  };

  const completedCount = items.filter(item => completedItems.includes(item.id)).length;
  const progress = Math.round((completedCount / items.length) * 100);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t('checklists.progress')}</span>
        <span className="font-medium">{completedCount}/{items.length} ({progress}%)</span>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const isCompleted = completedItems.includes(item.id);
          
          return (
            <div 
              key={item.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                isCompleted 
                  ? 'bg-status-ok-bg border-status-ok-border' 
                  : 'bg-background border-border hover:border-primary/50'
              )}
            >
              <Checkbox
                id={item.id}
                checked={isCompleted}
                onCheckedChange={(checked) => onToggleItem(item.id, checked as boolean)}
                className="mt-0.5"
              />
              
              <div className="flex-1 min-w-0">
                <label 
                  htmlFor={item.id}
                  className={cn(
                    'text-sm cursor-pointer',
                    isCompleted && 'line-through text-muted-foreground'
                  )}
                >
                  {t(item.labelKey)}
                </label>
                
                <div className="flex items-center gap-2 mt-1">
                  {item.helpPrompt && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs gap-1"
                      onClick={() => handleHelpClick(item.helpPrompt)}
                    >
                      <HelpCircle className="h-3 w-3" />
                      {t('documents.help')}
                    </Button>
                  )}
                  
                  {item.externalLink && (
                    <a
                      href={item.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {t(item.externalLinkLabel || 'common.learnMore')}
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
