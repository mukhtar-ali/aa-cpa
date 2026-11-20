import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContactFormLayout } from './ContactFormLayout';

const meta: Meta<typeof ContactFormLayout> = {
  title: 'Sections/ContactFormLayout',
  component: ContactFormLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=524-3651' } },
};
export default meta;
type Story = StoryObj<typeof ContactFormLayout>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="mx-auto max-w-285 p-8">
      <ContactFormLayout
        title="تواصل معنا"
        description="اكتب لنا وسنرد خلال يومي عمل."
        services={[{ value: 'audit', label: 'المراجعة' }]}
        onSubmit={async () => {}}
        labels={{ name: 'الاسم', mobile: 'رقم الجوال', email: 'البريد الإلكتروني', service: 'الخدمة', servicePlaceholder: 'اختر الخدمة', message: 'رسالتك', consent: 'أوافق على سياسة الخصوصية', submit: 'إرسال', required: 'هذا الحقل مطلوب', invalidMobile: 'رقم جوال غير صالح', invalidEmail: 'بريد إلكتروني غير صالح', summaryTitle: 'يرجى تصحيح الحقول التالية', success: 'شكرًا، وصلتنا رسالتك.', failure: 'تعذر الإرسال، حاول مرة أخرى.' }}
      />
    </div>
  ),
};
