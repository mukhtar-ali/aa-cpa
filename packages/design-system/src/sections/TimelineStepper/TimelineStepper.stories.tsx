import type { Meta, StoryObj } from '@storybook/react-vite';
import { TimelineStepper } from './TimelineStepper';

const meta: Meta<typeof TimelineStepper> = {
  title: 'Sections/TimelineStepper',
  component: TimelineStepper,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=519-38941' } },
};
export default meta;
type Story = StoryObj<typeof TimelineStepper>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-5xl">
      <TimelineStepper
        current={1}
        steps={[
          { index: 1, title: 'مراجعة الطلب', body: 'نقرأ كل طلب بعناية.' },
          { index: 2, title: 'المقابلة', body: 'حوار مباشر مع الشريك.' },
          { index: 3, title: 'العرض الوظيفي', body: 'عرض مكتوب خلال أسبوع.' },
        ]}
      />
    </div>
  ),
};
