import type { Meta, StoryObj } from '@storybook/react-vite';
import { CategoryBadge } from './CategoryBadge';

const meta: Meta<typeof CategoryBadge> = {
  title: 'Primitives/CategoryBadge',
  component: CategoryBadge,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=423-1145' } },
  args: { children: 'Articles' },
};
export default meta;
type Story = StoryObj<typeof CategoryBadge>;

export const Tones: Story = {
  render: () => (
    <div className="flex gap-6">
      <CategoryBadge>Articles</CategoryBadge>
      <CategoryBadge tone="green">News</CategoryBadge>
    </div>
  ),
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="flex gap-6">
      <CategoryBadge>مقالات</CategoryBadge>
      <CategoryBadge tone="green">أخبار</CategoryBadge>
    </div>
  ),
};
