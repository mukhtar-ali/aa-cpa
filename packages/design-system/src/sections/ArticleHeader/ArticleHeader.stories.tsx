import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArticleHeader } from './ArticleHeader';

const meta: Meta<typeof ArticleHeader> = {
  title: 'Sections/ArticleHeader',
  component: ArticleHeader,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=506-3931' } },
};
export default meta;
type Story = StoryObj<typeof ArticleHeader>;

const ph = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1140' height='480'%3E%3Crect width='1140' height='480' fill='%23566157'/%3E%3C/svg%3E";
const cover = { src: ph, alt: '', width: 1140, height: 480, decorative: true };

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-5xl">
      <ArticleHeader
        breadcrumbs={[{ label: 'الرئيسية', href: '#' }, { label: 'الأخبار', href: '#' }, { label: 'المراجعة', href: '#' }]}
        breadcrumbsLabel="مسار التنقل"
        category="المراجعة"
        title="ما الذي تجهّزه منشأتك قبل المراجعة السنوية؟"
        author={{ name: 'فريق الشبيشيري' }}
        meta="12 أكتوبر 2026 · 6 دقائق قراءة"
        dateISO="2026-10-12"
        cover={cover}
      />
    </div>
  ),
};

export const English: Story = {
  render: () => (
    <div className="max-w-5xl">
      <ArticleHeader
        breadcrumbs={[{ label: 'Home', href: '#' }, { label: 'News', href: '#' }, { label: 'Audit', href: '#' }]}
        breadcrumbsLabel="Breadcrumb"
        category="Audit"
        title="What should your company prepare before the annual audit?"
        author={{ name: 'Al-Shabibshiri team' }}
        meta="12 October 2026 · 6 min read"
        cover={cover}
      />
    </div>
  ),
};
