'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { DirectionProvider } from '@radix-ui/react-direction';

export type DesignSystemLocale = 'ar' | 'en';
export type DesignSystemDirection = 'rtl' | 'ltr';

export interface DesignSystemContextValue {
  locale: DesignSystemLocale;
  dir: DesignSystemDirection;
}

const DesignSystemContext = createContext<DesignSystemContextValue | null>(null);

export interface DesignSystemProviderProps {
  locale?: DesignSystemLocale;
  dir?: DesignSystemDirection;
  children: React.ReactNode;
}

export function DesignSystemProvider({
  locale = 'ar',
  dir,
  children,
}: DesignSystemProviderProps) {
  const resolvedDir: DesignSystemDirection = dir ?? (locale === 'ar' ? 'rtl' : 'ltr');

  const contextValue = useMemo(
    () => ({
      locale,
      dir: resolvedDir,
    }),
    [locale, resolvedDir],
  );

  return (
    <DesignSystemContext.Provider value={contextValue}>
      <DirectionProvider dir={resolvedDir}>{children}</DirectionProvider>
    </DesignSystemContext.Provider>
  );
}

export function useDesignSystem(): DesignSystemContextValue {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
}
