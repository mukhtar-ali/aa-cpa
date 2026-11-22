import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders the photo when an image is given', () => {
    render(<Avatar name="Ali Hassan" image={{ src: '/a.jpg', alt: 'Ali Hassan photo', width: 56, height: 56 }} />);
    const img = screen.getByRole('img', { name: 'Ali Hassan photo' });
    expect(img).toHaveAttribute('src', '/a.jpg');
    expect(img).toHaveClass('object-cover');
  });

  it('falls back to initials named by the person', () => {
    render(<Avatar name="Ali Hassan" />);
    const el = screen.getByRole('img', { name: 'Ali Hassan' });
    expect(el).toHaveTextContent('AH');
  });

  it('uses one initial for a single name and handles Arabic names', () => {
    const { rerender } = render(<Avatar name="Ali" />);
    expect(screen.getByRole('img', { name: 'Ali' })).toHaveTextContent('A');
    rerender(<Avatar name="محمد العتيبي" />);
    expect(screen.getByRole('img', { name: 'محمد العتيبي' })).toHaveTextContent('ما');
  });

  it('md is 56 px and sm is 40 px', () => {
    const { container, rerender } = render(<Avatar name="A B" />);
    expect(container.firstElementChild).toHaveClass('size-14', 'rounded-full');
    rerender(<Avatar name="A B" size="sm" />);
    expect(container.firstElementChild).toHaveClass('size-10');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Avatar name={lang === 'ar' ? 'محمد العتيبي' : 'Ali Hassan'} />
        <Avatar name="Sara" image={{ src: '/a.jpg', alt: 'Sara', width: 56, height: 56 }} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
