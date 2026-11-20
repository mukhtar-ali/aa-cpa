import type { Meta, StoryObj } from '@storybook/react-vite';
import { PillarCard } from './PillarCard';

const meta: Meta<typeof PillarCard> = {
  title: 'Sections/PillarCard',
  component: PillarCard,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3745' } },
};
export default meta;
type Story = StoryObj<typeof PillarCard>;

export const DarkArabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-sm bg-bg-inverse p-8">
      <PillarCard pillar={{ icon: 'scan', title: 'تقنية تختصر العمل، لا الحكم المهني.', body: 'أدوات التحليل لدينا تكشف الانحرافات أسرع من العينات اليدوية، ليذهب وقت الشريك إلى التفكير لا إلى العدّ.' }} />
    </div>
  ),
};

export const LightWide: Story = {
  render: () => (
    <div className="max-w-3xl">
      <PillarCard tone="light" size="wide" pillar={{ icon: 'globe-check', title: 'Part of a global network', body: 'Independent member of 3E Accounting in more than 80 countries.' }} />
    </div>
  ),
};
