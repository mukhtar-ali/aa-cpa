import type { Meta, StoryObj } from '@storybook/react-vite';
import { RelatedCarousel } from './RelatedCarousel';

const meta: Meta<typeof RelatedCarousel> = {
  title: 'Sections/RelatedCarousel',
  component: RelatedCarousel,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=506-4135' } },
};
export default meta;
type Story = StoryObj<typeof RelatedCarousel>;

const ph = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='267' height='250'%3E%3Crect width='267' height='250' fill='%23dcdedc'/%3E%3C/svg%3E";
const make = (title: string, category: string) =>
  [1, 2, 3, 4, 5, 6].map((n) => ({ id: 'r' + n, title, category, date: '2026-10-05', image: { src: ph, alt: '', width: 267, height: 250, decorative: true }, href: '#' }));

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="mx-auto max-w-285 bg-bg-page p-8">
      <RelatedCarousel title="مقالات ذات صلة" eyebrow="تابع القراءة" articles={make('تحديث جديد في أحكام الزكاة للمنشآت', 'الضريبة والزكاة')} readMoreLabel="اقرأ المزيد" prevLabel="السابق" nextLabel="التالي" progressLabel="المقالات ذات الصلة" />
    </div>
  ),
};

export const English: Story = {
  render: () => (
    <div className="mx-auto max-w-285 bg-bg-page p-8">
      <RelatedCarousel locale="en" title="Related articles" articles={make('A new update to zakat rules for companies', 'Tax and zakat')} readMoreLabel="Read more" prevLabel="Previous" nextLabel="Next" progressLabel="Related articles" />
    </div>
  ),
};
