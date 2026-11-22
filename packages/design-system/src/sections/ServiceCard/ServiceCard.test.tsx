import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ServiceCard } from './ServiceCard';

const service = {
  id: 'local',
  title: 'Local content review and certification',
  summary: 'Raise your local content ratio and compete for government contracts.',
  image: { src: '/team.jpg', alt: 'Saudi team at an industrial site', width: 429, height: 336 },
  href: '/services/local-content',
  ctaLabel: 'Learn about the service',
};

describe('ServiceCard', () => {
  it('is an article with an H2-sized title, summary and primary button link', () => {
    render(<ServiceCard service={service} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: service.title })).toHaveClass('text-h2', 'font-bold');
    expect(screen.getByText(service.summary)).toHaveClass('text-body-lg', 'opacity-80');
    const cta = screen.getByRole('link', { name: /^Learn about the service/ });
    expect(cta).toHaveAttribute('href', '/services/local-content');
    expect(cta).toHaveClass('bg-action-primary');
  });

  it('is the white 32 px card with the ice-950 text colour and a 20 px-radius photo', () => {
    render(<ServiceCard service={service} />);
    expect(screen.getByRole('article')).toHaveClass('rounded-card-lg', 'bg-bg-surface', 'text-ice-950');
    expect(screen.getByRole('img', { name: service.image.alt })).toHaveClass('rounded-card', 'aspect-[429/336]', 'object-cover');
  });

  it('can use another heading level and omits missing image and link', () => {
    const { container } = render(<ServiceCard level={3} service={{ id: 'x', title: 'Tax', summary: 'Summary' }} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Tax');
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <ServiceCard service={service} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
