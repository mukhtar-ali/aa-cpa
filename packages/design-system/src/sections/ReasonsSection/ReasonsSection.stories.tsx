import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReasonsSection } from './ReasonsSection';

const meta: Meta<typeof ReasonsSection> = {
  title: 'Sections/ReasonsSection',
  component: ReasonsSection,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3728' } },
};
export default meta;
type Story = StoryObj<typeof ReasonsSection>;

const ph = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='461' height='542'%3E%3Crect width='461' height='542' fill='%23566157'/%3E%3C/svg%3E";
const image = { src: ph, alt: '', width: 461, height: 542, decorative: true };

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="bg-bg-page">
      <ReasonsSection
        title="لماذا تنتقل المنشآت إلينا؟"
        description="الشخص الذي يراجع عملك هو نفسه من يجيبك عند أي استفسار. بلا طبقات وسيطة."
        pillars={[
          { icon: 'scan', title: 'تقنية تختصر العمل، لا الحكم المهني.', body: 'أدوات التحليل لدينا تكشف الانحرافات أسرع من العينات اليدوية.' },
          { icon: 'hexagon-dot', title: 'شركاء مرخّصون', body: 'ترخيص SOCPA رقم 522، ومراجعة يقودها شريك.' },
          { icon: 'globe-check', title: 'عضو في شبكة عالمية', body: 'عضو مستقل في شبكة 3E Accounting في أكثر من 80 دولة.' },
        ]}
        image={image}
        action={{ label: 'أطلب عرض سعر', href: '#' }}
        stats={[
          { value: 522, label: 'رقم رخصتنا لدى SOCPA' },
          { value: 4, suffix: 'أسابيع', label: 'متوسط إنجاز المراجعة' },
          { value: 120, prefix: '+', label: 'عميلًا في 8 قطاعات' },
          { value: 10, suffix: 'سنوات', label: 'من الممارسة المهنية' },
        ]}
      />
    </div>
  ),
};
