import React from 'react';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/i18n';
import { TextSize } from '@/types/case';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Type, 
  Sun, 
  Zap, 
  Eye,
  Palette
} from 'lucide-react';

const TEXT_SIZES: { value: TextSize; label: string }[] = [
  { value: 'small', label: 'accessibility.small' },
  { value: 'medium', label: 'accessibility.medium' },
  { value: 'large', label: 'accessibility.large' },
];

export function AccessibilityBar() {
  const { caseState, updateAccessibility } = useApp();
  const { accessibility } = caseState;

  return (
    <div 
      className="bg-card border-b border-border px-4 py-3"
      role="region"
      aria-label={t('accessibility.title')}
    >
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          {/* Text Size */}
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm font-medium sr-only md:not-sr-only">
              {t('accessibility.textSize')}
            </span>
            <div className="flex rounded-lg border border-input overflow-hidden" role="radiogroup" aria-label={t('accessibility.textSize')}>
              {TEXT_SIZES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateAccessibility({ textSize: value })}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors min-h-tap flex items-center ${
                    accessibility.textSize === value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-muted'
                  }`}
                  role="radio"
                  aria-checked={accessibility.textSize === value}
                  aria-label={t(label)}
                >
                  {value === 'small' ? 'A' : value === 'medium' ? 'A' : 'A'}
                  <span className="sr-only">{t(label)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Label htmlFor="high-contrast" className="text-sm cursor-pointer">
              {t('accessibility.highContrast')}
            </Label>
            <Switch
              id="high-contrast"
              checked={accessibility.highContrast}
              onCheckedChange={(checked) => updateAccessibility({ highContrast: checked })}
            />
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Label htmlFor="reduce-motion" className="text-sm cursor-pointer">
              {t('accessibility.reduceMotion')}
            </Label>
            <Switch
              id="reduce-motion"
              checked={accessibility.reduceMotion}
              onCheckedChange={(checked) => updateAccessibility({ reduceMotion: checked })}
            />
          </div>

          {/* Dyslexia Font */}
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Label htmlFor="dyslexia-font" className="text-sm cursor-pointer">
              {t('accessibility.dyslexiaFont')}
            </Label>
            <Switch
              id="dyslexia-font"
              checked={accessibility.dyslexiaFont}
              onCheckedChange={(checked) => updateAccessibility({ dyslexiaFont: checked })}
            />
          </div>

          {/* Colorblind Mode */}
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Label htmlFor="colorblind-mode" className="text-sm cursor-pointer">
              {t('accessibility.colorblindMode')}
            </Label>
            <Switch
              id="colorblind-mode"
              checked={accessibility.colorblindMode}
              onCheckedChange={(checked) => updateAccessibility({ colorblindMode: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
