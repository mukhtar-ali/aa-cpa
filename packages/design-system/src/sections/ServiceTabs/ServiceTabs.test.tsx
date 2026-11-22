import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { DesignSystemProvider } from '../../layout/DesignSystemProvider/DesignSystemProvider';
import { ServiceTabs } from './ServiceTabs';

const img = (name: string) => ({ src: `/${name}.jpg`, alt: `${name} photo`, width: 557, height: 470 });
const services = [
  { id: 'consulting', title: 'Professional consulting', summary: 'Consulting summary text.', image: img('consulting'), href: '/services/consulting', ctaLabel: 'Request a quote', highlight: { label: 'Average response time', value: '24 hours', note: 'From a licensed partner.' } },
  { id: 'audit', title: 'External audit', summary: 'Audit summary text.', image: img('audit'), href: '/services/audit', ctaLabel: 'Request a quote' },
  { id: 'local', title: 'Local content review', summary: 'Local content summary.' },
  { id: 'tax', title: 'Tax services', summary: 'Tax summary text.' },
];

const setup = (locale: 'ar' | 'en' = 'en') =>
  render(
    <DesignSystemProvider locale={locale}>
      <div dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
        <ServiceTabs eyebrow="Why AA-CPA" title="Audit and compliance for a smarter Saudi economy" services={services} tabsLabel="Services" />
      </div>
    </DesignSystemProvider>,
  );

describe('ServiceTabs', () => {
  it('shows the headline with the accent line above the photo when given', () => {
    render(
      <div lang="en" dir="ltr">
        <ServiceTabs eyebrow="Why" title="T" headline="Big-firm precision" headlineAccent="at local speed" services={services} tabsLabel="Services" />
      </div>,
    );
    expect(screen.getByText('Big-firm precision')).toHaveClass('text-h3', 'font-bold');
    expect(screen.getByText('at local speed')).toHaveClass('text-transparent');
  });

  it('has the H2, a labelled vertical tablist with one tab per service, and the first selected', () => {
    setup();
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('text-h5');
    const list = screen.getByRole('tablist', { name: 'Services' });
    expect(list).toHaveAttribute('aria-orientation', 'vertical');
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(4);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('tab labels are large (H3 size) and the selected one uses the heading colour', () => {
    setup();
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveClass('text-h3', 'font-bold', 'data-[state=active]:text-text-heading');
    expect(tabs[1]).toHaveClass('text-text-muted');
  });

  it('shows the selected panel with photo, floating card, summary and gradient link; other panels are hidden', () => {
    setup();
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveTextContent('Consulting summary text.');
    expect(screen.getByRole('img', { name: 'consulting photo' })).toHaveClass('aspect-[557/470]');
    expect(screen.getByText('24 hours')).toHaveClass('text-h3', 'text-transparent');
    expect(screen.getByText('Average response time')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Request a quote' })).toHaveAttribute('href', '/services/consulting');
    expect(screen.queryByText('Audit summary text.')).toBeNull();
  });

  it('clicking a tab swaps the panel content', async () => {
    setup();
    await userEvent.click(screen.getByRole('tab', { name: 'External audit' }));
    expect(screen.getByRole('tab', { name: 'External audit' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Audit summary text.');
    expect(screen.queryByText('Consulting summary text.')).toBeNull();
  });

  it('arrow keys move between tabs (vertical: Up/Down), Home and End jump, and activation follows focus', async () => {
    setup();
    await userEvent.tab();
    expect(screen.getAllByRole('tab')[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('tab', { name: 'External audit' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Audit summary text.');
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Tax services' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Professional consulting' })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('tab', { name: 'Tax services' })).toHaveFocus();
  });

  it('works the same in RTL', async () => {
    setup('ar');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getAllByRole('tab')[1]).toHaveFocus();
  });

  it('a service without image, highlight or link renders only its summary', async () => {
    setup();
    await userEvent.click(screen.getByRole('tab', { name: 'Local content review' }));
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveTextContent('Local content summary.');
    expect(panel.querySelector('img')).toBeNull();
    expect(panel.querySelector('a')).toBeNull();
  });

  it('renders nothing without services', () => {
    const { container } = render(<ServiceTabs title="T" services={[]} tabsLabel="Services" />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each(['ar', 'en'] as const)('has no axe violations in %s', async (lang) => {
    const { container } = setup(lang);
    expect(await axe(container)).toHaveNoViolations();
  });
});
