'use client';

import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion(): boolean {
  // Start with `false` on the server and on the first client render, then read the real value in the effect: reading matchMedia in the
  // initialiser made the server HTML and the first client render differ for people who prefer reduced motion (hydration mismatch).
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

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
