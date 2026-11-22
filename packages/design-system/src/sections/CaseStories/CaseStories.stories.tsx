import type { Meta, StoryObj } from '@storybook/react-vite';
import { CaseStories } from './CaseStories';

const meta: Meta<typeof CaseStories> = {
  title: 'Sections/CaseStories',
  component: CaseStories,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=547-4555' } },
};
export default meta;
type Story = StoryObj<typeof CaseStories>;

const ph = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='267' height='250'%3E%3Crect width='267' height='250' fill='%23dcdedc'/%3E%3C/svg%3E";
const story = (title: string, sector: string) => ({ title, sector, service: 'المراجعة الخارجية', image: { src: ph, alt: '', width: 267, height: 250, decorative: true }, href: '#', ctaLabel: 'اقرأ القصة' });

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="mx-auto max-w-285 px-4">
      <CaseStories eyebrow="قصص" title="قصص من القطاعات" stories={[story('مقاول يعبر إلى التمويل المصرفي', 'المقاولات'), story('تاجر تجزئة يضبط مخزونه', 'التجزئة'), story('مطوّر عقاري يوحّد تقاريره', 'العقار'), story('مصنع يرفع محتواه المحلي', 'الصناعة')]} />
    </div>
  ),
};
