import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { ApplicationFormLayout } from './ApplicationFormLayout';

const labels = { name: 'Name', mobile: 'Mobile', email: 'Email', coverLetter: 'Cover letter', cv: 'CV', consent: 'I agree', submit: 'Apply', required: 'Required', invalidMobile: 'Invalid mobile', invalidEmail: 'Invalid email', summaryTitle: 'Please fix', success: 'Application received', failure: 'Could not send' };
const uploadMessages = { prompt: 'Drag a file or', promptAction: 'browse', hint: 'PDF or Word, up to 5 MB', uploaded: (f: File) => `${f.name} attached`, remove: 'Remove', tooLarge: (f: File) => `${f.name} too large`, wrongType: (f: File) => `${f.name} wrong type` };

describe('ApplicationFormLayout', () => {
  it('requires fields and the CV', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ApplicationFormLayout title="Apply" labels={labels} uploadMessages={uploadMessages} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Please fix')).toBeInTheDocument();
    expect(screen.getAllByText('Required').length).toBeGreaterThanOrEqual(5);
  });

  it('submits with the CV and shows success', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    const { container } = render(<ApplicationFormLayout title="Apply" labels={labels} uploadMessages={uploadMessages} onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/Name/), 'Sara');
    await user.type(screen.getByLabelText(/Mobile/), '0555346560');
    await user.type(screen.getByLabelText(/Email/), 'sara@example.com');
    await user.upload(container.querySelector('input[type="file"]') as HTMLInputElement, new File(['x'], 'cv.pdf', { type: 'application/pdf' }));
    await user.click(screen.getByLabelText(/I agree/));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Application received'));
    expect(onSubmit.mock.calls[0]![0].cv.name).toBe('cv.pdf');
    expect(onSubmit.mock.calls[0]![0].website).toBe('');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <ApplicationFormLayout title="Apply" labels={labels} uploadMessages={uploadMessages} onSubmit={vi.fn()} aside={<p>Job</p>} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
