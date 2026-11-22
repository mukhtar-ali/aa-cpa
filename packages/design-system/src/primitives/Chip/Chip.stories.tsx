import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Primitives/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=499-1149' } },
};
export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  render: () => (
    <div className="flex gap-2">
      <Chip>Audit</Chip>
      <Chip>Tax</Chip>
    </div>
  ),
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="flex gap-2">
      <Chip>مراجعة</Chip>
      <Chip>ضرائب</Chip>
    </div>
  ),
};
