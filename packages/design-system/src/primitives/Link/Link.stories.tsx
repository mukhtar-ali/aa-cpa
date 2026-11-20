import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link } from './Link';

const meta: Meta<typeof Link> = {
  title: 'Primitives/Link',
  component: Link,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-169' } },
  args: { href: '#', children: 'Read more' },
};
export default meta;
type Story = StoryObj<typeof Link>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Link href="#">Inline link</Link>
      <Link href="#" variant="nav">
        Nav link
      </Link>
      <Link href="https://example.com" external>
        External link
      </Link>
    </div>
  ),
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="flex flex-col gap-3">
      <Link href="#">اقرأ المزيد</Link>
      <Link href="#" variant="nav">
        من نحن
      </Link>
    </div>
  ),
};
