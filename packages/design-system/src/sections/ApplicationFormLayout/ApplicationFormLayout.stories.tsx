import type { Meta, StoryObj } from '@storybook/react-vite';
import { ApplicationFormLayout } from './ApplicationFormLayout';

const meta: Meta<typeof ApplicationFormLayout> = {
  title: 'Sections/ApplicationFormLayout',
  component: ApplicationFormLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=514-3194' } },
};
export default meta;
type Story = StoryObj<typeof ApplicationFormLayout>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="mx-auto max-w-285 p-8">
      <ApplicationFormLayout
        title="قدّم على الوظيفة"
        onSubmit={async () => {}}
        labels={{ name: 'الاسم', mobile: 'رقم الجوال', email: 'البريد الإلكتروني', coverLetter: 'نبذة عنك', cv: 'السيرة الذاتية', consent: 'أوافق على سياسة الخصوصية', submit: 'إرسال الطلب', required: 'هذا الحقل مطلوب', invalidMobile: 'رقم جوال غير صالح', invalidEmail: 'بريد إلكتروني غير صالح', summaryTitle: 'يرجى تصحيح الحقول التالية', success: 'وصلنا طلبك.', failure: 'تعذر الإرسال.' }}
        uploadMessages={{ prompt: 'اسحب الملف هنا أو', promptAction: 'تصفّح', hint: 'PDF أو Word حتى 5 ميجابايت', uploaded: (f) => `تم إرفاق ${f.name}`, remove: 'إزالة', tooLarge: (f) => `${f.name} كبير جدًا`, wrongType: (f) => `${f.name} نوع غير مدعوم` }}
      />
    </div>
  ),
};
