import React from 'react';
import { cn } from '@/lib/utils';

interface ChipSelectorProps {
  options: { value: string; label: string; icon?: React.ReactNode }[];
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
}

export function ChipSelector({ options, value, onChange, className, ariaLabel }: ChipSelectorProps) {
  return (
    <div 
      className={cn('flex flex-wrap gap-3', className)}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all min-h-tap',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            value === option.value
              ? 'border-primary bg-primary-light text-primary'
              : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted'
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
