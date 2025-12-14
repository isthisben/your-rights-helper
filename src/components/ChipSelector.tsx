import React from 'react';
import { cn } from '@/lib/utils';

interface ChipSelectorProps {
  options: { value: string; label: string; icon?: React.ReactNode }[];
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
  large?: boolean;
}

export function ChipSelector({ options, value, onChange, className, ariaLabel, large = false }: ChipSelectorProps) {
  return (
    <div 
      className={cn('flex flex-wrap gap-3 justify-center', className)}
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
            'flex items-center gap-2 rounded-2xl border-2 font-medium transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            large 
              ? 'px-6 py-5 text-lg md:text-xl min-h-[70px]' 
              : 'px-4 py-3 text-sm min-h-tap',
            value === option.value
              ? 'border-primary bg-primary-light text-primary'
              : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted'
          )}
        >
          {option.icon && (
            <span className={cn(large ? '[&>svg]:h-6 [&>svg]:w-6' : '')}>
              {option.icon}
            </span>
          )}
          {option.label}
        </button>
      ))}
    </div>
  );
}
