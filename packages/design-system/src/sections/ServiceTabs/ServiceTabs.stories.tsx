import type { Meta, StoryObj } from '@storybook/react-vite';
import { ServiceTabs } from './ServiceTabs';

const meta: Meta<typeof ServiceTabs> = {
  title: 'Sections/ServiceTabs',
  component: ServiceTabs,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3712' } },
};
export default meta;
type Story = StoryObj<typeof ServiceTabs>;

const ph = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='557' height='470'%3E%3Crect width='557' height='470' fill='%23566157'/%3E%3C/svg%3E";
const image = { src: ph, alt: '', width: 557, height: 470, decorative: true };

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <ServiceTabs
        eyebrow="لماذا شركة عبدالرحمن الشبيشيري"
        title="مراجعة وامتثال يواكبان اقتصادًا سعوديًا أكثر ذكاءً"
        tabsLabel="الخدمات"
        services={[
          { id: 'consulting', title: 'الاستشارات المهنية', summary: 'تقارير مراجعة جاهزة للبنوك ومجالس الإدارة، يراجعها شريك مرخّص مباشرة، لا فريق مبتدئين متغيّر.', image, href: '#', ctaLabel: 'الحصول على عرض سعر', highlight: { label: 'متوسط زمن الرد على استفسارك', value: '24 ساعة', note: 'من شريك مرخّص مباشرةً، لا من موظف استقبال.' } },
          { id: 'audit', title: 'المراجعة الخارجية', summary: 'مراجعة مستقلة وفق معايير الهيئة السعودية للمراجعين والمحاسبين.', image, href: '#', ctaLabel: 'الحصول على عرض سعر' },
          { id: 'local', title: 'مراجعة المحتوى المحلي', summary: 'شهادات المحتوى المحلي بتوقيع شريك يعرف اشتراطات الجهات.' },
          { id: 'tax', title: 'الخدمات الضريبية', summary: 'إقرارات الزكاة والضريبة بدقة وفي مواعيدها.' },
        ]}
      />
    </div>
  ),
};
