import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Primitives/Divider',
  component: Divider,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3785' } },
};
export default meta;
type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Divider />
      <div className="bg-bg-inverse p-4">
        <Divider tone="dark" />
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="bg-bg-inverse p-4 flex h-24 items-stretch gap-6" dir="rtl" lang="ar">
      <span className="text-text-inverse">10 سنوات</span>
      <Divider orientation="vertical" tone="dark" />
      <span className="text-text-inverse">+120 عميلًا</span>
    </div>
  ),
};
