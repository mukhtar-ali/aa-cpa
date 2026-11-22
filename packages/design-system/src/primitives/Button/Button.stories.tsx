import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Icon } from '../../icons';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=64-20' },
    docs: {
      description: {
        component:
          'Verified against the approved homepage: primary 411:3706, secondary 411:3709, paper (beige, for dark sections) 411:3735, link (gradient label) 411:3714. md is 48 px tall like the homepage; lg is 52 px.',
      },
    },
  },
  args: { children: 'Learn more' },
};
export default meta;
type Story = StoryObj<typeof Button>;

const variants = ['primary', 'secondary', 'paper', 'link'] as const;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(['md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-4">
          {variants.map((variant) => (
            <div key={variant} className={variant === 'paper' ? 'bg-bg-inverse p-3' : 'p-3'}>
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
      <Button variant="link" endIcon={<Icon name="arrow" />}>
        Link with arrow (mirrors in RTL)
      </Button>
      <Button startIcon={<Icon name="search" />}>Start icon</Button>
    </div>
  ),
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="flex flex-wrap items-center gap-4">
      <Button>أعرف المزيد</Button>
      <Button variant="secondary">خدماتنا</Button>
      <Button variant="link" endIcon={<Icon name="arrow" />}>
        الحصول على عرض سعر
      </Button>
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
