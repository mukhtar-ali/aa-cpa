import type { Meta, StoryObj } from '@storybook/react-vite';
import { FaqAccordion } from './FaqAccordion';

const meta: Meta<typeof FaqAccordion> = {
  title: 'Sections/FaqAccordion',
  component: FaqAccordion,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=463-3590' } },
};
export default meta;
type Story = StoryObj<typeof FaqAccordion>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-5xl">
      <FaqAccordion
        title="الأسئلة الشائعة"
        defaultOpenId="q1"
        items={[
          { id: 'q1', question: 'كم تستغرق المراجعة الخارجية؟', answer: 'في المتوسط أربعة أسابيع من استلام الملف كاملًا، ونحدد الجدول الزمني كتابةً من أول اتصال.' },
          { id: 'q2', question: 'من يوقّع على تقرير المراجعة؟', answer: 'يوقّع كل تقرير شريك مرخّص من الهيئة السعودية للمراجعين والمحاسبين.' },
          { id: 'q3', question: 'هل تتعاملون مع البنوك مباشرة؟', answer: 'نعم، نسلّم التقارير بالصيغة التي تطلبها الجهة.' },
        ]}
      />
    </div>
  ),
};

export const English: Story = {
  render: () => (
    <div className="max-w-5xl">
      <FaqAccordion
        title="Frequently asked questions"
        items={[
          { id: 'q1', question: 'How long does an external audit take?', answer: 'About four weeks from receiving the complete file; we agree the timeline in writing from the first call.' },
          { id: 'q2', question: 'Who signs the audit report?', answer: 'A SOCPA-licensed partner signs every report.' },
        ]}
      />
    </div>
  ),
};
