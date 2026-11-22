import type { Meta, StoryObj } from '@storybook/react-vite';
import { Rating } from './Rating';

const meta: Meta<typeof Rating> = {
  title: 'Primitives/Rating',
  component: Rating,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3871' } },
  args: { value: 5, label: '5 of 5' },
};
export default meta;
type Story = StoryObj<typeof Rating>;

export const Values: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {([5, 4, 3, 2, 1] as const).map((v) => (
        <Rating key={v} value={v} label={v + ' of 5'} />
      ))}
    </div>
  ),
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <Rating value={4} label="4 من 5" />
    </div>
  ),
};
