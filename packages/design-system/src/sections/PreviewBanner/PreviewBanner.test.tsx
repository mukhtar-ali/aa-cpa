import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { PreviewBanner } from './PreviewBanner';

describe('PreviewBanner', () => {
  it('announces preview mode and links to the exit route', () => {
    render(<PreviewBanner message="Preview mode" exitLabel="Exit preview" exitHref="/api/preview/exit?path=/en" />);
    expect(screen.getByRole('status')).toHaveTextContent('Preview mode');
    expect(screen.getByRole('link', { name: 'Exit preview' })).toHaveAttribute('href', '/api/preview/exit?path=/en');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang}>
        <PreviewBanner message={lang === 'ar' ? 'وضع المعاينة' : 'Preview mode'} exitLabel={lang === 'ar' ? 'إنهاء' : 'Exit'} exitHref="/x" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
