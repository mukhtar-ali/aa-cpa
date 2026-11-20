import type { Meta, StoryObj } from '@storybook/react-vite';
import { NewsCard, NewsGrid } from './NewsCard';

const meta: Meta<typeof NewsCard> = {
  title: 'Sections/NewsCard',
  component: NewsCard,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=423-1145' } },
};
export default meta;
type Story = StoryObj<typeof NewsCard>;

const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='267' height='250'%3E%3Crect width='267' height='250' fill='%23dcdedc'/%3E%3C/svg%3E";
const image = { src: placeholder, alt: '', width: 267, height: 250, decorative: true };
const ar = { id: 'n1', title: 'كيف يغيّر الذكاء الاصطناعي عمل مراجع الحسابات؟', category: 'مقالات', date: '2026-10-12', image, href: '#' };
const en = { id: 'n1', title: 'How AI is changing the work of an auditor', category: 'Articles', date: '2026-10-12', image, href: '#' };

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-xs">
      <NewsCard article={ar} readMoreLabel="اقرأ المزيد" />
    </div>
  ),
};

export const GridEnglish: Story = {
  render: () => (
    <NewsGrid
      locale="en"
      readMoreLabel="Read more"
      articles={[en, { ...en, id: 'n2' }, { ...en, id: 'n3' }, { ...en, id: 'n4' }]}
    />
  ),
};
