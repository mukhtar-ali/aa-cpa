import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeaturedNews } from './FeaturedNews';

const meta: Meta<typeof FeaturedNews> = {
  title: 'Sections/FeaturedNews',
  component: FeaturedNews,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=473-36031' } },
};
export default meta;
type Story = StoryObj<typeof FeaturedNews>;

const ph = (w: number, h: number) => "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h + "'%3E%3Crect width='" + w + "' height='" + h + "' fill='%23566157'/%3E%3C/svg%3E";
const art = (id: string, w = 72, h = 75) => ({ id, title: 'تحديث جديد في أحكام الزكاة للمنشآت', category: 'الضريبة والزكاة', date: '2026-10-05', image: { src: ph(w, h), alt: '', width: w, height: h, decorative: true }, href: '#', excerpt: 'ملخص قصير عن أهم ما تغيّر وما يعنيه لمنشأتك.' });

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="mx-auto max-w-285 p-8">
      <FeaturedNews featured={art('f', 640, 360)} latest={[art('l1'), art('l2'), art('l3')]} latestTitle="أحدث المقالات" readMoreLabel="اقرأ المزيد" />
    </div>
  ),
};
