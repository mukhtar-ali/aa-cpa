import type { Meta, StoryObj } from '@storybook/react-vite';
import { Eyebrow } from './Eyebrow';

const meta: Meta<typeof Eyebrow> = {
  title: 'Primitives/Eyebrow',
  component: Eyebrow,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3722' } },
  args: { children: 'Why choose us' },
};
export default meta;
type Story = StoryObj<typeof Eyebrow>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Eyebrow>Why choose us</Eyebrow>
      <div className="bg-bg-inverse p-6">
        <Eyebrow tone="inverse">On a dark section</Eyebrow>
      </div>
    </div>
  ),
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <Eyebrow>لماذا شركة عبدالرحمن الشبيشيري</Eyebrow>
    </div>
  ),
};
