import type { Meta, StoryObj } from '@storybook/react-vite';
import { MethodologyList } from './MethodologyList';

const meta: Meta<typeof MethodologyList> = {
  title: 'Sections/MethodologyList',
  component: MethodologyList,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=448-42778' } },
};
export default meta;
type Story = StoryObj<typeof MethodologyList>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-5xl">
      <MethodologyList
        title="منهجيتنا"
        rows={[
          { title: 'الفحص الميداني والاختبارات', body: 'اختبارات جوهرية للأرصدة والمعاملات والضوابط الداخلية، مدعومة بأدوات تحليل ذكية تكشف الانحرافات أسرع من العينات اليدوية.' },
          { title: 'التقرير والتوقيع', body: 'تقرير جاهز للبنوك ومجالس الإدارة، يوقّعه شريك مرخّص.' },
        ]}
      />
    </div>
  ),
};

export const English: Story = {
  render: () => (
    <div className="max-w-5xl">
      <MethodologyList
        title="Our methodology"
        rows={[
          { title: 'Fieldwork and testing', body: 'Substantive tests of balances, transactions and internal controls, backed by analytics that find deviations faster than manual sampling.' },
          { title: 'Reporting', body: 'A signed report ready for banks and boards.' },
        ]}
      />
    </div>
  ),
};
