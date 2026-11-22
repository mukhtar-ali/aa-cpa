import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3878' } },
  args: { name: 'Ali Hassan' },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Initials: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar name="Ali Hassan" />
      <Avatar name="Ali Hassan" size="sm" />
      <Avatar name="محمد العتيبي" />
    </div>
  ),
};
