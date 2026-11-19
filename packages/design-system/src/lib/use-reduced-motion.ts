'use client';

import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia(QUERY);
    setReducedMotion(mediaQuery.matches);

    const onChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setReducedMotion('matches' in event ? event.matches : mediaQuery.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onChange as (e: Event) => void);
      return () => {
        mediaQuery.removeEventListener('change', onChange as (e: Event) => void);
      };
    }

    mediaQuery.addListener(onChange as (e: MediaQueryListEvent) => void);
    return () => {
      mediaQuery.removeListener(onChange as (e: MediaQueryListEvent) => void);
    };
  }, []);

  return reducedMotion;
}
