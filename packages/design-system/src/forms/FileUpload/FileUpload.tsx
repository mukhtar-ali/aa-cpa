'use client';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';

export interface FileUploadMessages {
  /** Drop-zone sentence before the action, for example "Drag your CV here or". */
  prompt: string;
  /** The underlined action, for example "choose a file". */
  promptAction: string;
  /** Hint under the prompt, for example "PDF or DOCX, up to 5 MB". */
  hint: string;
  /** Status line of an accepted file, for example "240 KB · uploaded". */
  uploaded: (file: File) => string;
  /** Accessible name of the remove button. */
  remove: string;
  tooLarge: (file: File) => string;
  wrongType: (file: File) => string;
}

export interface FileUploadProps {
  id: string;
  /** Accessible name of the control. */
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** Allowed extensions (".pdf") and/or MIME types ("application/pdf", "image/*"). */
  accept: string[];
  /** Default 5 MB. */
  maxSizeBytes?: number;
  messages: FileUploadMessages;
  /** Error from the surrounding form (for example "required"); shown in the same place as the file errors. */
  error?: string;
  className?: string;
}

const MB = 1024 * 1024;

export function isAccepted(file: File, accept: string[]): boolean {
  const name = file.name.toLowerCase();
  return accept.some((rule) => {
    const r = rule.trim().toLowerCase();
    if (r.startsWith('.')) return name.endsWith(r);
    if (r.endsWith('/*')) return file.type.toLowerCase().startsWith(r.slice(0, -1));
    return file.type.toLowerCase() === r;
  });
}

/**
 * File picker with drag and drop (Figma 522:1214: dashed emerald zone 150 px, uploaded row 88 px). Validates type and size
 * (default 5 MB) and announces problems with `role="alert"`. The zone is a real button, so it works with keyboard and screen readers.
 *
 * @figma 522:1214
 */
export function FileUpload({ id, label, file, onFileChange, accept, maxSizeBytes = 5 * MB, messages, error: externalError, className }: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const zoneRef = React.useRef<HTMLButtonElement>(null);
  const focusZoneNext = React.useRef(false);
  const focusRemoveNext = React.useRef(false);
  const removeRef = React.useRef<HTMLButtonElement>(null);
  const [fileError, setError] = React.useState('');
  const error = fileError || externalError || '';
  const [dragging, setDragging] = React.useState(false);

  React.useEffect(() => {
    if (!file && focusZoneNext.current) {
      focusZoneNext.current = false;
      zoneRef.current?.focus();
    }
    // The zone button unmounts when a file is chosen: keep keyboard focus inside the control.
    if (file && focusRemoveNext.current) {
      focusRemoveNext.current = false;
      removeRef.current?.focus();
    }
  }, [file]);

  const handleFiles = (list: FileList | null) => {
    const picked = list?.[0];
    if (!picked) return;
    if (!isAccepted(picked, accept)) {
      setError(messages.wrongType(picked));
      return;
    }
    if (picked.size > maxSizeBytes) {
      setError(messages.tooLarge(picked));
      return;
    }
    setError('');
    focusRemoveNext.current = true;
    onFileChange(picked);
  };

  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <input
        ref={inputRef}
        id={`${id}-input`}
        type="file"
        accept={accept.join(',')}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      {file ? (
        <div className="flex h-22 items-center gap-4 rounded-upload border border-solid border-neutral-200 bg-neutral-0 px-6 border-(length:--border-width-focus)">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-field bg-emerald-50 text-text-link">
            <Icon name="file" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="truncate text-body-md font-bold text-text-heading" dir="auto">
              {file.name}
            </p>
            <p className="text-body-xs text-text-link" dir="auto">
              {messages.uploaded(file)}
            </p>
          </div>
          <button
            ref={removeRef}
            type="button"
            aria-label={messages.remove}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-bg-page"
            onClick={() => {
              focusZoneNext.current = true;
              setError('');
              onFileChange(null);
            }}
          >
            <Icon name="close" size={20} />
          </button>
        </div>
      ) : (
        <button
          ref={zoneRef}
          id={id}
          type="button"
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(hintId, error && errorId)}
          data-dragging={dragging || undefined}
          className={cn(
            'flex h-37.5 w-full flex-col items-center justify-center gap-1 rounded-upload border border-dashed bg-emerald-50 px-4 text-center',
            'border-(length:--border-width-focus) border-emerald-400 transition-colors duration-(--motion-duration-fast) ease-standard',
            'data-[dragging]:border-emerald-600 data-[dragging]:bg-bg-surface-ice',
            error && 'border-status-error',
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <span className="mb-2 inline-flex size-13 items-center justify-center rounded-full bg-bg-surface text-text-link">
            <Icon name="upload" />
          </span>
          <span className="text-body-md font-bold text-text-heading">
            <span className="sr-only">{label}: </span>
            {messages.prompt} <span className="text-text-link underline">{messages.promptAction}</span>
          </span>
          <span id={hintId} className="text-body-xs text-neutral-500">
            {messages.hint}
          </span>
        </button>
      )}
      {error ? (
        <p id={errorId} role="alert" className="text-body-xs text-status-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
