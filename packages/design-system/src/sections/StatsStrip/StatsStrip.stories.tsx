import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatsStrip } from './StatsStrip';

const meta: Meta<typeof StatsStrip> = {
  title: 'Sections/StatsStrip',
  component: StatsStrip,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3772' } },
};
export default meta;
type Story = StoryObj<typeof StatsStrip>;

export const ArabicDark: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <StatsStrip
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

export const EnglishLight: Story = {
  render: () => (
    <StatsStrip
      tone="light"
      locale="en"
      stats={[
        { value: 522, label: 'SOCPA licence number' },
        { value: 4, suffix: 'weeks', label: 'Average review turnaround' },
        { value: 120, prefix: '+', label: 'Clients in 8 sectors' },
        { value: 10, suffix: 'years', label: 'Of professional practice' },
      ]}
    />
  ),
};
