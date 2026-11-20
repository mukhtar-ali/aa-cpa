import type { Meta, StoryObj } from '@storybook/react-vite';
import { CtaCards } from './CtaCards';

const meta: Meta<typeof CtaCards> = {
  title: 'Sections/CtaCards',
  component: CtaCards,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=448-43007' } },
};
export default meta;
type Story = StoryObj<typeof CtaCards>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="bg-bg-page p-8">
      <CtaCards
        title="لست متأكداً إذا كانت الخدمة لك أو لا؟"
        cards={[
          { icon: 'help', title: 'استكشف الأسئلة الشائعة', body: 'مرّر للأسفل لتجد إجابات عن أكثر الأسئلة شيوعًا.', action: { label: 'الأسئلة الشائعة', href: '#' } },
          { icon: 'message', title: 'تحدّث مع خبير', body: 'شاركنا بعض التفاصيل عن منشأتك، وسيساعدك فريقنا على اختيار الباقة الأنسب لاحتياجاتك.', action: { label: 'تواصل معنا', href: '#' }, tone: 'dark' },
        ]}
      />
    </div>
  ),
};

export const English: Story = {
  render: () => (
    <div className="bg-bg-page p-8">
      <CtaCards
        cards={[
          { icon: 'help', title: 'Explore the FAQ', body: 'Scroll down to find answers to the most common questions.', action: { label: 'FAQ', href: '#' } },
          { icon: 'message', title: 'Talk to an expert', body: 'Share a few details about your business and we will help you choose.', action: { label: 'Contact us', href: '#' }, tone: 'dark' },
        ]}
      />
    </div>
  ),
};
