import type { Meta, StoryObj } from '@storybook/react-vite';
import { EstimatorSection } from './EstimatorSection';

const meta: Meta<typeof EstimatorSection> = {
  title: 'Sections/EstimatorSection',
  component: EstimatorSection,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3854' } },
};
export default meta;
type Story = StoryObj<typeof EstimatorSection>;

const arLabels = {
  progress: 'السؤال {n} من {total}',
  next: 'التالي',
  back: 'رجوع',
  start: 'ابدأ التقدير',
  result: 'التقدير الاسترشادي',
  disclaimer: 'النتيجة تقديرية فقط ولا تُعد التزامًا.',
  restart: 'ابدأ من جديد',
  invalid: 'أدخل إجابة صحيحة',
  error: 'حدث خطأ، يرجى المحاولة مرة أخرى',
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <EstimatorSection
        heading="لست مستعدًا للحديث بعد؟ احصل على رقم خلال 60 ثانية"
        intro="أجب عن أربعة أسئلة لتحصل على تقدير استرشادي، دون أي التزام."
        ratingLabel="5 من 5"
        testimonial={{ quote: 'شريك يعرف اسمنا ويسلّم تقريره موقّعًا في موعده، دون طبقات وسيطة.', rating: 5, name: 'عمر السالم', role: 'المدير المالي', company: 'شركة نموذجية للمقاولات' }}
        estimator={{
          title: 'لست مستعدًا للحديث بعد؟ احصل على رقم خلال 60 ثانية',
          intro: 'أجب عن أربعة أسئلة لتحصل على تقدير استرشادي.',
          locale: 'ar',
          config: {
            questions: [
              { id: 'revenue', prompt: 'الإيرادات السنوية التقريبية (ريال)', kind: 'currency', min: 1, placeholder: '12,000,000' },
              { id: 'staff', prompt: 'عدد الموظفين', kind: 'number', min: 1, max: 10000 },
              { id: 'sector', prompt: 'القطاع', kind: 'choice', options: [{ value: 'retail', label: 'التجزئة' }, { value: 'industry', label: 'الصناعة' }] },
              { id: 'deadline', prompt: 'الموعد المطلوب', kind: 'choice', options: [{ value: 'soon', label: 'خلال شهر' }, { value: 'later', label: 'لاحقًا' }] },
            ],
            labels: arLabels,
            currency: 'SAR',
            estimate: async () => ({ min: 90000, max: 140000 }),
            quote: {
              label: 'اطلب عرض سعر رسميًا',
              fields: { name: 'الاسم الكامل', mobile: 'رقم الجوال', email: 'البريد الإلكتروني', consent: 'أوافق على التواصل معي' },
              submitLabel: 'إرسال الطلب',
              successMessage: 'شكرًا لك، سنتواصل معك قريبًا.',
              onSubmit: async () => undefined,
            },
          },
        }}
      />
    </div>
  ),
};
