import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { LogoMarquee } from './LogoMarquee';

const logo = (name: string) => ({ name, image: { src: `/${name}.svg`, alt: name, width: 120, height: 60 } });
const rows = [[logo('Shell'), logo('BYD'), logo('SFT')], [logo('Safa'), logo('Kafaat')]];
const original = window.matchMedia;

afterEach(() => {
  window.matchMedia = original;
});

const setReducedMotion = (matches: boolean) => {
  window.matchMedia = ((query: string) => ({ ...original(query), matches, media: query })) as typeof window.matchMedia;
};

describe('LogoMarquee', () => {
  it('is a labelled region with one track per row', () => {
    const { container } = render(<LogoMarquee label="Our clients" rows={rows} pauseLabel="Pause animation" />);
    expect(screen.getByRole('region', { name: 'Our clients' })).toBeInTheDocument();
    expect(container.querySelectorAll('.ds-marquee-track')).toHaveLength(2);
  });

  it('names every logo once: the duplicated track is aria-hidden with empty alt text', () => {
    const { container } = render(<LogoMarquee label="Our clients" rows={rows} pauseLabel="Pause animation" />);
    expect(screen.getAllByRole('img')).toHaveLength(5);
    expect(screen.getAllByRole('img', { name: 'Shell' })).toHaveLength(1);
    const hidden = container.querySelectorAll('ul[aria-hidden="true"]');
    expect(hidden).toHaveLength(2);
    hidden.forEach((ul) => ul.querySelectorAll('img').forEach((img) => expect(img).toHaveAttribute('alt', '')));
    expect(within(hidden[0] as HTMLElement).queryAllByRole('img')).toHaveLength(0);
  });

  it('neighbouring rows scroll in opposite directions', () => {
    const { container } = render(<LogoMarquee label="x" rows={rows} pauseLabel="Pause" />);
    const tracks = container.querySelectorAll('.ds-marquee-track');
    expect(tracks[0]).toHaveAttribute('data-reverse', 'false');
    expect(tracks[1]).toHaveAttribute('data-reverse', 'true');
  });

  it('the pause button toggles aria-pressed and the paused state', async () => {
    const { container } = render(<LogoMarquee label="x" rows={rows} pauseLabel="Pause animation" />);
    const button = screen.getByRole('button', { name: 'Pause animation' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(container.querySelector('.ds-marquee-track')).toHaveAttribute('data-paused', 'false');
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(container.querySelector('.ds-marquee-track')).toHaveAttribute('data-paused', 'true');
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('is paused from the start under prefers-reduced-motion and the button cannot restart it', () => {
    setReducedMotion(true);
    const { container } = render(<LogoMarquee label="x" rows={rows} pauseLabel="Pause" />);
    expect(container.querySelector('.ds-marquee-track')).toHaveAttribute('data-paused', 'true');
    expect(screen.getByRole('button', { name: 'Pause' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Pause' })).toBeDisabled();
  });

  it('sets the loop duration through a CSS variable', () => {
    const { container } = render(<LogoMarquee label="x" rows={rows} pauseLabel="Pause" duration={30} />);
    expect((container.querySelector('.ds-marquee-track') as HTMLElement).style.getPropertyValue('--ds-marquee-duration')).toBe('30s');
  });

  it('edge fades are decorative', () => {
    const { container } = render(<LogoMarquee label="x" rows={[rows[0]!]} pauseLabel="Pause" />);
    expect(container.querySelectorAll('div[aria-hidden="true"]')).toHaveLength(2);
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <LogoMarquee label="Our clients" rows={rows} pauseLabel="Pause animation" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
