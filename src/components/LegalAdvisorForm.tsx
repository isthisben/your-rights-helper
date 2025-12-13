import React, { useState } from 'react';
import { t } from '@/lib/i18n';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, Check, UserPlus } from 'lucide-react';

interface LegalAdvisorFormProps {
  onComplete?: () => void;
  compact?: boolean;
}

export function LegalAdvisorForm({ onComplete, compact = false }: LegalAdvisorFormProps) {
  const { caseState, updateCaseState } = useApp();
  
  const [name, setName] = useState(caseState.legalAdvisor?.name || '');
  const [phone, setPhone] = useState(caseState.legalAdvisor?.phone || '');
  const [email, setEmail] = useState(caseState.legalAdvisor?.email || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateCaseState({
      legalAdvisor: {
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onComplete?.();
  };

  const handleSkip = () => {
    onComplete?.();
  };

  const hasAnyInfo = name || phone || email;

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-foreground">
          <UserPlus className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{t('legalAdvisor.compactTitle')}</span>
        </div>
        
        <div className="grid gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('legalAdvisor.namePlaceholder')}
            className="h-9 text-sm"
          />
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('legalAdvisor.phonePlaceholder')}
            type="tel"
            className="h-9 text-sm"
          />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('legalAdvisor.emailPlaceholder')}
            type="email"
            className="h-9 text-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            size="sm" 
            disabled={!hasAnyInfo}
            className="flex-1"
          >
            {saved ? <Check className="h-4 w-4 mr-1" /> : null}
            {saved ? t('common.saved') : t('common.save')}
          </Button>
          <Button onClick={handleSkip} variant="ghost" size="sm">
            {t('legalAdvisor.skip')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          {t('legalAdvisor.title')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('legalAdvisor.description')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="advisor-name" className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            {t('legalAdvisor.name')}
          </Label>
          <Input
            id="advisor-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('legalAdvisor.namePlaceholder')}
            className="min-h-tap"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="advisor-phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            {t('legalAdvisor.phone')}
          </Label>
          <Input
            id="advisor-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('legalAdvisor.phonePlaceholder')}
            className="min-h-tap"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="advisor-email" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            {t('legalAdvisor.email')}
          </Label>
          <Input
            id="advisor-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('legalAdvisor.emailPlaceholder')}
            className="min-h-tap"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={!hasAnyInfo} className="flex-1 min-h-tap">
          {saved ? <Check className="h-4 w-4 mr-2" /> : null}
          {saved ? t('common.saved') : t('common.save')}
        </Button>
        <Button onClick={handleSkip} variant="outline" className="min-h-tap">
          {t('legalAdvisor.skip')}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        {t('legalAdvisor.hint')}
      </p>
    </div>
  );
}
