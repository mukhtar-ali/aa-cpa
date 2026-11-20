import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProcessSteps } from './ProcessSteps';

const meta: Meta<typeof ProcessSteps> = {
  title: 'Sections/ProcessSteps',
  component: ProcessSteps,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3825' } },
};
export default meta;
type Story = StoryObj<typeof ProcessSteps>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <ProcessSteps
        steps={[
          { index: 1, title: 'مكالمة تعريفية', body: 'نفهم نشاطك ونطاق العمل والمواعيد التي تلتزم بها أمام البنك أو الجهة الرقابية.' },
          { index: 2, title: 'عرض سعر خلال 7 أيام عمل', body: 'عرض مكتوب بالنطاق والأتعاب والجدول الزمني، دون بنود مخفية.' },
          { index: 3, title: 'عمل ميداني يقوده شريك', body: 'يشرف شريك مرخّص على الفريق، وتكشف أدوات التحليل الانحرافات مبكرًا.' },
          { index: 4, title: 'تقرير موقّع وتسليم', body: 'تقرير جاهز للبنوك ومجالس الإدارة، ومتابعة بعد التسليم لأي استفسار.' },
        ]}
      />
    </div>
  ),
};

export const English: Story = {
  render: () => (
    <ProcessSteps
      locale="en"
      steps={[
        { index: 1, title: 'Intro call', body: 'We understand your business, scope and deadlines.' },
        { index: 2, title: 'Quote in 7 working days', body: 'A written quote with scope, fees and timeline.' },
        { index: 3, title: 'Partner-led fieldwork', body: 'A licensed partner supervises the team.' },
        { index: 4, title: 'Signed report', body: 'Ready for banks and boards.' },
      ]}
    />
  ),
};
