import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { FileUpload, isAccepted } from './FileUpload';

const messages = {
  prompt: 'Drag your CV here or',
  promptAction: 'choose a file',
  hint: 'PDF or DOCX, up to 5 MB',
  uploaded: (f: File) => `${Math.round(f.size / 1024)} KB · uploaded`,
  remove: 'Remove file',
  tooLarge: () => 'File is larger than 5 MB',
  wrongType: () => 'Only PDF or DOCX files are accepted',
};
const accept = ['.pdf', '.docx'];
const makeFile = (name: string, size = 1024, type = 'application/pdf') => {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

function Harness({ initial = null as File | null }: { initial?: File | null }) {
  const [file, setFile] = React.useState<File | null>(initial);
  return <FileUpload id="cv" label="CV" file={file} onFileChange={setFile} accept={accept} messages={messages} />;
}

describe('isAccepted', () => {
  it('matches extensions, MIME types and wildcards case-insensitively', () => {
    expect(isAccepted(makeFile('a.PDF'), ['.pdf'])).toBe(true);
    expect(isAccepted(makeFile('a.png', 1, 'image/png'), ['image/*'])).toBe(true);
    expect(isAccepted(makeFile('a.pdf', 1, 'application/pdf'), ['application/pdf'])).toBe(true);
    expect(isAccepted(makeFile('a.exe', 1, 'application/x-msdownload'), ['.pdf', '.docx'])).toBe(false);
  });
});

describe('FileUpload', () => {
  it('empty state: a button zone with prompt, action and hint', () => {
    render(<Harness />);
    const zone = screen.getByRole('button', { name: 'CV' });
    expect(zone).toHaveTextContent('Drag your CV here or choose a file');
    expect(zone).toHaveAccessibleDescription('PDF or DOCX, up to 5 MB');
    expect(zone).toHaveClass('border-dashed', 'bg-emerald-50', 'rounded-upload');
  });

  it('opens the file picker from the zone with the keyboard', async () => {
    const { container } = render(<Harness />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const click = vi.spyOn(input, 'click');
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'CV' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(click).toHaveBeenCalledTimes(1);
    expect(input).toHaveAttribute('accept', '.pdf,.docx');
  });

  it('accepts a picked valid file and shows the uploaded row with the status', async () => {
    const { container } = render(<Harness />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, makeFile('cv.pdf', 240 * 1024));
    expect(screen.getByText('cv.pdf')).toBeInTheDocument();
    expect(screen.getByText('240 KB · uploaded')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('accepts a dropped valid file', () => {
    render(<Harness />);
    const zone = screen.getByRole('button', { name: 'CV' });
    fireEvent.drop(zone, { dataTransfer: { files: [makeFile('cv.docx', 2048, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')] } });
    expect(screen.getByText('cv.docx')).toBeInTheDocument();
  });

  it('rejects a file over 5 MB and announces it with role="alert"', () => {
    render(<Harness />);
    fireEvent.drop(screen.getByRole('button', { name: 'CV' }), { dataTransfer: { files: [makeFile('big.pdf', 6 * 1024 * 1024)] } });
    expect(screen.getByRole('alert')).toHaveTextContent('File is larger than 5 MB');
    expect(screen.queryByText('big.pdf')).toBeNull();
    expect(screen.getByRole('button', { name: 'CV' })).toHaveAccessibleDescription(/File is larger than 5 MB/);
  });

  it('rejects a wrong type and announces it', () => {
    render(<Harness />);
    fireEvent.drop(screen.getByRole('button', { name: 'CV' }), { dataTransfer: { files: [makeFile('virus.exe', 100, 'application/x-msdownload')] } });
    expect(screen.getByRole('alert')).toHaveTextContent('Only PDF or DOCX files are accepted');
  });

  it('a valid file after an error clears the alert', () => {
    render(<Harness />);
    const zone = screen.getByRole('button', { name: 'CV' });
    fireEvent.drop(zone, { dataTransfer: { files: [makeFile('big.pdf', 6 * 1024 * 1024)] } });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.drop(zone, { dataTransfer: { files: [makeFile('ok.pdf')] } });
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('ok.pdf')).toBeInTheDocument();
  });

  it('remove returns to the empty state and moves focus to the zone', async () => {
    render(<Harness initial={makeFile('cv.pdf')} />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove file' }));
    expect(screen.queryByText('cv.pdf')).toBeNull();
    expect(screen.getByRole('button', { name: 'CV' })).toHaveFocus();
  });

  it('dragging over highlights the zone', () => {
    render(<Harness />);
    const zone = screen.getByRole('button', { name: 'CV' });
    fireEvent.dragOver(zone);
    expect(zone).toHaveAttribute('data-dragging', 'true');
    fireEvent.dragLeave(zone);
    expect(zone).not.toHaveAttribute('data-dragging');
  });

  it.each(['ar', 'en'])('has no axe violations in %s (empty, uploaded, error)', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Harness />
        <Harness initial={makeFile('cv.pdf')} />
      </div>,
    );
    fireEvent.drop(screen.getAllByRole('button', { name: 'CV' })[0]!, { dataTransfer: { files: [makeFile('big.pdf', 6 * 1024 * 1024)] } });
    expect(await axe(container)).toHaveNoViolations();
  });
});
