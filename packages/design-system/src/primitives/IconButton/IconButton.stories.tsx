import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from './IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'Primitives/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=529-4427' } },
  args: { label: 'Next', icon: 'chevron' },
};
export default meta;
type Story = StoryObj<typeof IconButton>;

export const SliderNav: Story = {
  render: () => (
    <div className="flex gap-3">
      <IconButton label="Previous" icon="chevron" reverseIcon />
      <IconButton label="Next" icon="chevron" variant="solid" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <IconButton label="Close" icon="close" />
        <IconButton label="Close" icon="close" variant="solid" />
        <IconButton label="Close" icon="close" size="sm" />
      </div>
      <div className="flex items-center gap-3 bg-bg-inverse p-4">
        <IconButton label="LinkedIn" icon="linkedin" variant="ghost-light" href="#" />
        <IconButton label="WhatsApp" icon="whatsapp" variant="ghost-light" href="#" />
      </div>
    </div>
  ),
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="flex gap-3">
      <IconButton label="السابق" icon="chevron" reverseIcon />
      <IconButton label="التالي" icon="chevron" variant="solid" />
    </div>
  ),
};
