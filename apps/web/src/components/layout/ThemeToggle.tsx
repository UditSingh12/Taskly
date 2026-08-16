'use client';

import * as React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeTransition } from '@/lib/hooks/useThemeTransition';
import { cn } from '@/lib/utils';

export interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'pill';
}

export function ThemeToggle({ className, variant = 'icon' }: ThemeToggleProps) {
  const { toggleTheme, isDark } = useThemeTransition();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          'h-8 w-8 rounded-full border border-border bg-transparent',
          className
        )}
      />
    );
  }

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-xs font-medium text-foreground hover:bg-secondary transition-all',
          className
        )}
        title="Toggle dark/light mode"
      >
        {isDark ? (
          <>
            <Sun className="h-3.5 w-3.5 text-amber-400" />
            <span>Light mode</span>
          </>
        ) : (
          <>
            <Moon className="h-3.5 w-3.5 text-indigo-500" />
            <span>Dark mode</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className
      )}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
    >
      <Sun
        className={cn(
          'h-4 w-4 transition-all duration-300',
          isDark ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100 text-amber-500'
        )}
      />
      <Moon
        className={cn(
          'h-4 w-4 transition-all duration-300',
          isDark ? 'rotate-0 scale-100 opacity-100 text-indigo-400' : '-rotate-90 scale-0 opacity-0 absolute'
        )}
      />
    </button>
  );
}
