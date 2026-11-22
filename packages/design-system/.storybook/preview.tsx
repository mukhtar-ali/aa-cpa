import React from 'react';
import type { Preview } from '@storybook/react-vite';
import './storybook.css';
import '../assets/fonts/almarai.css';
import { DesignSystemProvider } from '../src/layout/DesignSystemProvider/DesignSystemProvider';

const preview: Preview = {
  parameters: {
    a11y: {
      test: 'error',
    },
  },
  globalTypes: {
    locale: {
      description: 'Internationalization locale',
      defaultValue: 'ar',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'ar', right: '🇸🇦', title: 'العربية (RTL)' },
          { value: 'en', right: '🇺🇸', title: 'English (LTR)' },
        ],
        showName: true,
      },
    },
    tone: {
      description: 'Section tone background',
      defaultValue: 'page',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'page', title: 'Page' },
          { value: 'ice', title: 'Ice' },
          { value: 'surface', title: 'Surface' },
          { value: 'inverse', title: 'Inverse' },
          { value: 'hero', title: 'Hero' },
        ],
        showName: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const locale = (context.globals.locale || 'ar') as 'ar' | 'en';
      const dir = locale === 'ar' ? 'rtl' : 'ltr';
      const tone = (context.globals.tone || 'page') as string;

      if (typeof document !== 'undefined') {
        document.documentElement.lang = locale;
        document.documentElement.dir = dir;
      }

      return (
        <div data-tone={tone} dir={dir} className="min-h-screen">
          <DesignSystemProvider locale={locale} dir={dir}>
            <Story />
          </DesignSystemProvider>
        </div>
      );
    },
  ],
};

export default preview;
