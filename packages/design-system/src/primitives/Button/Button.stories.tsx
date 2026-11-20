import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=64-20' },
    docs: {
      description: {
        component:
          'Primary (Figma 411:3706) and sizes (64:20) are verified. secondary, outline-light and link are provisional until compared with 411:3709, 411:3735 and 411:3714.',
      },
    },
  },
  args: { children: 'Learn more' },
};
export default meta;
type Story = StoryObj<typeof Button>;

const variants = ['primary', 'secondary', 'outline-light', 'link'] as const;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(['md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-4">
          {variants.map((variant) => (
            <div key={variant} className={variant === 'outline-light' ? 'bg-bg-inverse p-3' : 'p-3'}>
              <Button variant={variant} size={size}>
                {variant} {size}
              </Button>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
      <Button loading>Loading</Button>
      <Button href="#">As link</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button endIcon={<span aria-hidden="true">→</span>}>End arrow (mirrors in RTL)</Button>
      <Button startIcon={<span aria-hidden="true">+</span>}>Start icon</Button>
    </div>
  ),
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="flex flex-wrap items-center gap-4">
      <Button endIcon={<span aria-hidden="true">→</span>}>أعرف المزيد</Button>
      <Button variant="secondary">تواصل معنا</Button>
      <Button variant="link">اقرأ المزيد</Button>
    </div>
  ),
};

export const LongLabel: Story = {
  render: () => (
    <div className="max-w-xs">
      <Button className="w-full">A very long button label that should wrap or truncate gracefully inside narrow containers</Button>
    </div>
  ),
};
