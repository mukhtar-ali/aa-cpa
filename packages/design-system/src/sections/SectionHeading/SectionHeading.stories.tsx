import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionHeading } from './SectionHeading';

const meta: Meta<typeof SectionHeading> = {
  title: 'Sections/SectionHeading',
  component: SectionHeading,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=530-4339' } },
};
export default meta;
type Story = StoryObj<typeof SectionHeading>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-4xl">
      <SectionHeading eyebrow="كيف نعمل" title="من أول اتصال إلى تقرير يحمل توقيع شريك" description="مسار واضح من أربع خطوات، بمواعيد معلنة من البداية." />
    </div>
  ),
};

export const SplitWithAction: Story = {
  render: () => (
    <SectionHeading
      split
      eyebrow="News"
      title="Articles that matter to your business"
      description="Insights on audit, tax and compliance in Saudi Arabia."
      action={{ label: 'All articles', href: '#' }}
    />
  ),
};

export const DarkWithAccent: Story = {
  render: () => (
    <div className="bg-bg-inverse p-8">
      <SectionHeading tone="dark" eyebrow="Estimator" title="Not ready to talk yet?" accent="Get a number in 60 seconds" />
    </div>
  ),
};
