'use client';

import { useTheme } from 'next-themes';
import { useCallback } from 'react';
import { api } from '../api-client';

export function useThemeTransition() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = useCallback(
    async (event?: React.MouseEvent) => {
      const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';

      // Check if browser supports View Transition API
      if (typeof document !== 'undefined' && 'startViewTransition' in document) {
        // Set coordinates based on button click or default to top right
        const x = event?.clientX ?? window.innerWidth - 80;
        const y = event?.clientY ?? 40;

        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        const transition = (document as any).startViewTransition(async () => {
          setTheme(nextTheme);
        });

        await transition.ready;

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
            filter: ['blur(8px)', 'blur(0px)'],
          },
          {
            duration: 500,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      } else {
        setTheme(nextTheme);
      }

      // Persist theme to backend if logged in
      try {
        await api.updateTheme({ theme: nextTheme });
      } catch {
        // Non-blocking if guest session is offline
      }
    },
    [resolvedTheme, setTheme]
  );

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
  };
}
