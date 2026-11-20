import type { Meta, StoryObj } from '@storybook/react-vite';
import { SlideCounter } from './SlideCounter';

const meta: Meta<typeof SlideCounter> = {
  title: 'Primitives/SlideCounter',
  component: SlideCounter,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=448-41066' } },
  args: { current: 2, total: 5, label: 'Slide' },
};
export default meta;
type Story = StoryObj<typeof SlideCounter>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-xs">
      <SlideCounter {...args} />
    </div>
  ),
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-xs">
      <SlideCounter current={3} total={5} label="الشريحة" />
    </div>
  ),
};
