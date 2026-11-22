'use client';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { IconButton } from '../../primitives/IconButton';

export interface ShareBoxLabels {
  /** Accessible names of the four buttons. */
  copyLink: string;
  whatsapp: string;
  linkedin: string;
  x: string;
  /** Label of the copy button in the link field (dark card), for example "Copy". */
  copy: string;
  /** Shown after copying, announced politely, for example "Link copied". */
  copied: string;
}

export interface ShareBoxProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Absolute URL of the page to share. */
  url: string;
  title: string;
  /** Text sent to WhatsApp and X. Defaults to `title`; pass the article title when `title` is a heading such as "Share this article". */
  shareText?: string;
  description?: string;
  labels: ShareBoxLabels;
  /** `bar` = light ice strip inside the article (506:3982); `card` = dark sidebar card with a link field (506:4011). */
  variant?: 'bar' | 'card';
}

export function shareLinks(url: string, text: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return {
    whatsapp: `https://wa.me/?text=${t}%20${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    x: `https://x.com/intent/post?url=${u}&text=${t}`,
  };
}

/**
 * Share box: copy-link, WhatsApp, LinkedIn and X buttons (44 px circles). The dark card variant adds a read-only link field with a copy
 * button. Copying uses the Clipboard API and announces the result.
 *
 * @figma 506:3982, 506:4011, 505:3864
 */
export function ShareBox({ url, title, shareText, description, labels, variant = 'bar', className, ...props }: ShareBoxProps) {
  const [copied, setCopied] = React.useState(false);
  const links = shareLinks(url, shareText ?? title);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      // Reset so a second copy is announced again.
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };
  const dark = variant === 'card';
  const buttonClass = 'size-11';
  const variantProp = dark ? 'ghost-light' : 'outline';
  return (
    <section className={cn('flex flex-col gap-5 rounded-cta p-6', dark ? 'bg-bg-inverse text-text-inverse' : 'bg-bg-surface-ice text-text-heading', className)} {...props}>
      <div className={cn('flex flex-col gap-1', !dark && 'sm:flex-row sm:items-center sm:justify-between sm:gap-6')}>
        <div className="flex flex-col gap-1">
          <h2 className={cn(dark ? 'text-h5' : 'text-h6', 'font-bold')}>{title}</h2>
          {description ? <p className={cn('text-body-sm', dark ? 'text-text-inverse-muted' : 'text-text-body')}>{description}</p> : null}
        </div>
        <div className="flex gap-2.5">
          <IconButton label={labels.copyLink} icon="link" variant={variantProp} className={buttonClass} onClick={copy} />
          <IconButton label={labels.whatsapp} icon="whatsapp" variant={variantProp} className={buttonClass} href={links.whatsapp} external />
          <IconButton label={labels.linkedin} icon="linkedin" variant={variantProp} className={buttonClass} href={links.linkedin} external />
          <IconButton label={labels.x} icon="x" variant={variantProp} className={buttonClass} href={links.x} external />
        </div>
      </div>
      {dark ? (
        <div className="flex items-center gap-2 rounded-field border border-solid border-border-inverse-strong bg-bg-inverse-raised p-1.5">
          <button type="button" onClick={copy} className="h-10 shrink-0 rounded-sm bg-bg-page px-5 text-body-sm font-bold text-text-strong">
            {labels.copy}
          </button>
          <input readOnly value={url} dir="ltr" aria-label={labels.copyLink} className="min-w-0 flex-1 bg-transparent px-2 text-body-sm text-text-inverse outline-none" />
        </div>
      ) : null}
      <p role="status" className="sr-only">
        {copied ? labels.copied : ''}
      </p>
    </section>
  );
}
