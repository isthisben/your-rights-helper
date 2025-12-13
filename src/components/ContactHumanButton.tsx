import React, { useState } from 'react';
import { t } from '@/lib/i18n';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Phone, Mail, User, ExternalLink } from 'lucide-react';

interface ContactHumanButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function ContactHumanButton({ 
  variant = 'outline', 
  size = 'default',
  className,
  showLabel = true 
}: ContactHumanButtonProps) {
  const { caseState } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  
  const legalAdvisor = caseState.legalAdvisor;
  const hasAdvisor = legalAdvisor && (legalAdvisor.name || legalAdvisor.phone || legalAdvisor.email);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={className}
          aria-label={t('contact.humanHelp')}
        >
          <Phone className="h-4 w-4" />
          {showLabel && <span className="ml-2">{t('contact.humanHelp')}</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('contact.title')}</DialogTitle>
          <DialogDescription>
            {t('contact.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* User's legal advisor if set */}
          {hasAdvisor && (
            <div className="bg-primary-light rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">
                  {t('contact.yourAdvisor')}
                </span>
              </div>
              
              {legalAdvisor.name && (
                <p className="text-foreground font-medium">{legalAdvisor.name}</p>
              )}
              
              {legalAdvisor.phone && (
                <a 
                  href={`tel:${legalAdvisor.phone}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {legalAdvisor.phone}
                </a>
              )}
              
              {legalAdvisor.email && (
                <a 
                  href={`mailto:${legalAdvisor.email}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {legalAdvisor.email}
                </a>
              )}
            </div>
          )}
          
          {/* Free helplines */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">
              {t('contact.freeHelplines')}
            </h4>
            
            <a 
              href="https://www.acas.org.uk/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div>
                <p className="font-medium text-foreground">ACAS</p>
                <p className="text-sm text-muted-foreground">0300 123 1100</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            
            <a 
              href="https://www.citizensadvice.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div>
                <p className="font-medium text-foreground">Citizens Advice</p>
                <p className="text-sm text-muted-foreground">{t('contact.citizensAdviceDesc')}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            
            <a 
              href="https://www.lawworks.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div>
                <p className="font-medium text-foreground">LawWorks</p>
                <p className="text-sm text-muted-foreground">{t('contact.lawWorksDesc')}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
          
          {!hasAdvisor && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              {t('contact.addAdvisorHint')}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
