import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { ContactFormLayout } from './ContactFormLayout';

const labels = { name: 'Name', mobile: 'Mobile', email: 'Email', service: 'Service', servicePlaceholder: 'Choose', message: 'Message', consent: 'I agree to the privacy policy', submit: 'Send', required: 'Required', invalidMobile: 'Invalid mobile', invalidEmail: 'Invalid email', summaryTitle: 'Please fix', success: 'Thank you', failure: 'Could not send' };
const services = [{ value: 'audit', label: 'Audit' }];

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Name/), 'Sara');
  await user.type(screen.getByLabelText(/Mobile/), '0555346560');
  await user.type(screen.getByLabelText(/Email/), 'sara@example.com');
  await user.type(screen.getByLabelText(/Message/), 'Hello');
  await user.click(screen.getByLabelText(/privacy policy/));
}

describe('ContactFormLayout', () => {
  it('shows required errors and does not submit an empty form', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ContactFormLayout title="Contact" labels={labels} services={services} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Please fix')).toBeInTheDocument();
    expect(screen.getAllByText('Required').length).toBeGreaterThanOrEqual(4);
  });

  it('rejects an invalid mobile and email', async () => {
    const user = userEvent.setup();
    render(<ContactFormLayout title="Contact" labels={labels} services={services} onSubmit={vi.fn()} />);
    await user.type(screen.getByLabelText(/Mobile/), '123');
    await user.type(screen.getByLabelText(/Email/), 'nope');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(screen.getAllByText('Invalid mobile').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Invalid email').length).toBeGreaterThan(0);
  });

  it('submits trimmed values with the honeypot and elapsed time, then shows the success message', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ContactFormLayout title="Contact" labels={labels} services={services} onSubmit={onSubmit} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Thank you'));
    const sent = onSubmit.mock.calls[0]![0];
    expect(sent).toMatchObject({ name: 'Sara', mobile: '0555346560', email: 'sara@example.com', consent: true, website: '' });
    expect(typeof sent.elapsedMs).toBe('number');
  });

  it('announces a failure and keeps the form', async () => {
    const user = userEvent.setup();
    render(<ContactFormLayout title="Contact" labels={labels} services={services} onSubmit={vi.fn().mockRejectedValue(new Error('x'))} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not send');
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('hides the honeypot from assistive tech and the tab order; renders the aside', () => {
    const { container } = render(<ContactFormLayout title="Contact" labels={labels} services={services} onSubmit={vi.fn()} aside={<p>Side</p>} />);
    const trap = container.querySelector('input[name="website"]')!;
    expect(trap).toHaveAttribute('aria-hidden', 'true');
    expect(trap).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('complementary')).toHaveTextContent('Side');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <ContactFormLayout title="Contact" labels={labels} services={services} onSubmit={vi.fn()} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
