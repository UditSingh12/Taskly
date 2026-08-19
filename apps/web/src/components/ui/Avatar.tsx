import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  url?: string;
}

export function Avatar({
  name = 'User',
  color = '#4F46E5',
  size = 'md',
  className,
  url,
  ...props
}: AvatarProps) {
  const getInitials = (str: string) => {
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const sizes = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
    xl: 'h-16 w-16 text-2xl',
  };

  const dicebearUrl = url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}&backgroundColor=${color.replace('#', '')}&scale=80`;

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white shadow-sm ring-1 ring-white/10 select-none overflow-hidden',
        sizes[size],
        className
      )}
      style={{ backgroundColor: color }}
      title={name}
      {...props}
    >
      <img src={dicebearUrl} alt={name} className="w-full h-full object-cover" />
    </div>
  );
}
