import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
import { iconMeta, iconNames } from './generated';

const meta: Meta<typeof Icon> = {
  title: 'Icons/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: {
    design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=527-5423' },
    docs: {
      description: {
        component:
          'Icons are exported from Figma (homepage cards, contact, share, meta and upload icons). They render at their native size by default and follow currentColor; arrows and chevrons will mirror in RTL when added.',
      },
    },
  },
  args: { name: 'phone' },
};
export default meta;
type Story = StoryObj<typeof Icon>;

export const Gallery: Story = {
  render: () => (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
      {iconNames.map((name) => (
        <li key={name} className="flex flex-col items-center gap-2 rounded-card border border-border-subtle bg-bg-surface p-4 text-text-link">
          <Icon name={name} />
          <span className="text-body-xs text-text-muted" dir="ltr">
            {name} ({iconMeta[name].size}px)
          </span>
        </li>
      ))}
    </ul>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4 text-text-link">
      {[16, 24, 32, 48].map((size) => (
        <Icon key={size} name="location" size={size} />
      ))}
    </div>
  ),
};

export const Accessible: Story = {
  render: () => (
    <div className="flex items-center gap-4 text-text-link">
      <Icon name="phone" title="Call us" />
      <Icon name="mail" />
    </div>
  ),
};

export const OnDark: Story = {
  render: () => (
    <div className="flex items-center gap-4 bg-bg-inverse p-6 text-text-inverse">
      <Icon name="hexagon-dot" />
      <Icon name="scan" />
      <Icon name="globe-check" />
    </div>
  ),
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="flex items-center gap-4 text-text-link">
      <Icon name="location" />
      <span className="text-body-md text-text-body">الرياض، المملكة العربية السعودية</span>
    </div>
  ),
};
