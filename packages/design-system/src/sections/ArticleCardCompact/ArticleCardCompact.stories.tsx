import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArticleCardCompact } from './ArticleCardCompact';

const meta: Meta<typeof ArticleCardCompact> = {
  title: 'Sections/ArticleCardCompact',
  component: ArticleCardCompact,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=501-1155' } },
};
export default meta;
type Story = StoryObj<typeof ArticleCardCompact>;

const ph = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='75'%3E%3Crect width='72' height='75' fill='%23668073'/%3E%3C/svg%3E";
const a = { id: 'a', title: 'عنوان الخبر يُكتب هنا في سطرين', category: 'مقالات', date: '2026-10-12', image: { src: ph, alt: '', width: 72, height: 75, decorative: true }, href: '#' };

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-sm bg-bg-inverse p-6">
      <ArticleCardCompact article={a} />
      <ArticleCardCompact article={{ ...a, id: 'b' }} divider={false} />
    </div>
  ),
};
