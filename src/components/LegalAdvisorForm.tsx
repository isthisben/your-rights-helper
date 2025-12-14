import React, { useState } from 'react';
import { t } from '@/lib/i18n';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, Check, UserPlus } from 'lucide-react';

interface LegalAdvisorFormProps {
  onComplete?: () => void;
  compact?: boolean;
  large?: boolean;
}

export function LegalAdvisorForm({ onComplete, compact = false, large = false }: LegalAdvisorFormProps) {
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
      <div className={cn("space-y-6", large && "space-y-8")}>
        <div className={cn("flex items-center gap-3 justify-center", large && "flex-col")}>
          <UserPlus className={cn("text-primary", large ? "h-10 w-10" : "h-4 w-4")} />
          <span className={cn("font-medium text-foreground", large ? "text-2xl md:text-3xl" : "text-sm")}>
            {t('legalAdvisor.compactTitle')}
          </span>
        </div>
        
        {large && (
          <p className="text-lg md:text-xl text-muted-foreground text-center">
            {t('legalAdvisor.description')}
          </p>
        )}
        
        <div className={cn("grid gap-4", large && "gap-5")}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('legalAdvisor.namePlaceholder')}
            className={cn(large ? "h-14 text-lg rounded-2xl px-5" : "h-9 text-sm")}
          />
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('legalAdvisor.phonePlaceholder')}
            type="tel"
            className={cn(large ? "h-14 text-lg rounded-2xl px-5" : "h-9 text-sm")}
          />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('legalAdvisor.emailPlaceholder')}
            type="email"
            className={cn(large ? "h-14 text-lg rounded-2xl px-5" : "h-9 text-sm")}
          />
        </div>
        
        <div className={cn("flex gap-3", large && "gap-4")}>
          <Button 
            onClick={handleSave} 
            size={large ? "lg" : "sm"}
            disabled={!hasAnyInfo}
            className={cn("flex-1", large && "text-lg py-6 rounded-2xl")}
          >
            {saved ? <Check className={cn(large ? "h-5 w-5 mr-2" : "h-4 w-4 mr-1")} /> : null}
            {saved ? t('common.saved') : t('common.save')}
          </Button>
          <Button 
            onClick={handleSkip} 
            variant="ghost" 
            size={large ? "lg" : "sm"}
            className={cn(large && "text-lg py-6")}
          >
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
