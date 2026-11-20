import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from './Logo';

const meta: Meta<typeof Logo> = {
  title: 'Primitives/Logo',
  component: Logo,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=78-197' } },
  args: { label: 'AA-CPA' },
};
export default meta;
type Story = StoryObj<typeof Logo>;

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="bg-bg-page p-6">
        <Logo {...args} variant="on-light" />
      </div>
      <div className="bg-bg-hero p-6">
        <Logo {...args} variant="on-dark" />
      </div>
    </div>
  ),
};
