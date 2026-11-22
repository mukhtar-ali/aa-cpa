import type { Meta, StoryObj } from '@storybook/react-vite';
import { WhatsAppFloat } from './WhatsAppFloat';

const meta: Meta<typeof WhatsAppFloat> = {
  title: 'Layout/WhatsAppFloat',
  component: WhatsAppFloat,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=226-10011' } },
  args: { href: 'https://wa.me/966500000000', label: 'WhatsApp' },
};
export default meta;
type Story = StoryObj<typeof WhatsAppFloat>;

export const English: Story = {
  render: (args) => (
    <div className="relative h-80">
      <WhatsAppFloat {...args} />
    </div>
  ),
};

export const Arabic: Story = {
  render: (args) => (
    <div dir="rtl" lang="ar" className="relative h-80">
      <WhatsAppFloat {...args} label="واتساب" />
    </div>
  ),
};
