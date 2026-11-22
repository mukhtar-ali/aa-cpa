import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { JobRow, JobSummaryCard } from './JobRow';

const job = { id: 'j1', title: 'Senior auditor', department: 'Audit', city: 'Riyadh', contract: 'Full time', experience: '5+ years', postedAt: '2026-10-01', closesAt: '2026-11-15', href: '/careers/senior-auditor' };
const labels = { department: 'Department', city: 'City', contract: 'Contract', experience: 'Experience', postedAt: 'Posted', closesAt: 'Closes' };

describe('JobRow', () => {
  it('the whole row is one link; it contains an H3 at the H5 size and the muted meta line', () => {
    render(<JobRow job={job} detailsLabel="View details" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/careers/senior-auditor');
    expect(within(link).getByRole('heading', { level: 3, name: 'Senior auditor' })).toHaveClass('text-h5', 'font-bold');
    expect(within(link).getByText(/Audit\s+·\s+Riyadh\s+·\s+Full time/)).toHaveClass('text-body-sm', 'text-text-muted');
  });

  it('is the white 24 px card, 112 px high, with the ice fill and emerald border on hover', () => {
    render(<JobRow job={job} detailsLabel="View details" />);
    expect(screen.getByRole('link')).toHaveClass('min-h-28', 'rounded-cta', 'bg-bg-surface', 'border-border-subtle', 'hover:bg-bg-surface-ice', 'hover:border-emerald-500');
  });

  it('the details pill is decorative, turns inverse on hover and its chevron mirrors in RTL', () => {
    const { container } = render(<JobRow job={job} detailsLabel="View details" />);
    const pill = screen.getByText('View details');
    expect(pill).toHaveAttribute('aria-hidden', 'true');
    expect(pill).toHaveClass('h-12', 'group-hover:bg-bg-inverse', 'group-hover:text-text-inverse');
    expect(container.querySelector('svg')).toHaveClass('rtl:-scale-x-100');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <JobRow job={job} detailsLabel="View details" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('JobSummaryCard', () => {
  it('is a description list of the job facts with time elements for dates', () => {
    const { container } = render(<JobSummaryCard job={job} labels={labels} locale="en" />);
    expect(container.querySelector('dl')).not.toBeNull();
    expect(container.querySelectorAll('dt')).toHaveLength(6);
    expect(screen.getByText('Department').nextElementSibling).toHaveTextContent('Audit');
    expect(screen.getByText('Closes').nextElementSibling?.querySelector('time')).toHaveAttribute('datetime', '2026-11-15');
    expect(screen.getByText('November 15, 2026')).toBeInTheDocument();
  });

  it('skips fields without a value', () => {
    const { container } = render(<JobSummaryCard job={{ ...job, experience: undefined, postedAt: undefined, closesAt: undefined }} labels={labels} />);
    expect(container.querySelectorAll('dt')).toHaveLength(3);
  });

  it.each(['ar', 'en'] as const)('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <JobSummaryCard job={job} labels={labels} locale={lang} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
