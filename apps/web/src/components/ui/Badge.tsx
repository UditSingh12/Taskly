import * as React from 'react';
import { cn } from '@/lib/utils';
import { TaskPriority, TaskStatus } from '@taskly/shared-types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'priority' | 'status' | 'tag';
  priority?: TaskPriority;
  status?: TaskStatus;
}

export function Badge({
  className,
  variant = 'default',
  priority,
  status,
  children,
  ...props
}: BadgeProps) {
  const getPriorityStyle = (p?: TaskPriority) => {
    switch (p) {
      case 'high':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'low':
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const getStatusStyle = (s?: TaskStatus) => {
    switch (s) {
      case 'doing':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'on_hold':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'todo':
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
        variant === 'default' && 'bg-secondary text-secondary-foreground border-transparent',
        variant === 'outline' && 'border-border text-foreground',
        variant === 'tag' && 'bg-secondary/70 text-muted-foreground border-border/50 text-[11px] rounded-full px-2.5',
        variant === 'priority' && getPriorityStyle(priority),
        variant === 'status' && getStatusStyle(status),
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
