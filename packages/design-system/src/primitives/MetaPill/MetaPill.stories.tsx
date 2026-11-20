import type { Meta, StoryObj } from '@storybook/react-vite';
import { MetaPill } from './MetaPill';

const meta: Meta<typeof MetaPill> = {
  title: 'Primitives/MetaPill',
  component: MetaPill,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=529-4333' } },
  args: { icon: 'location', children: 'Riyadh' },
};
export default meta;
type Story = StoryObj<typeof MetaPill>;

export const AllIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <MetaPill icon="location">Riyadh</MetaPill>
      <MetaPill icon="contract">Full time</MetaPill>
      <MetaPill icon="experience">5+ years</MetaPill>
      <MetaPill icon="date">12 Oct 2026</MetaPill>
    </div>
  ),
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="flex flex-wrap gap-3">
      <MetaPill icon="location">الرياض</MetaPill>
      <MetaPill icon="contract">دوام كامل</MetaPill>
      <MetaPill icon="experience">5+ سنوات</MetaPill>
      <MetaPill icon="date">12 أكتوبر 2026</MetaPill>
    </div>
  ),
};
