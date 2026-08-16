import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, icon, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-foreground">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3 text-muted-foreground pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            suppressHydrationWarning
            className={cn(
              'flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-9',
              error && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] text-destructive">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
