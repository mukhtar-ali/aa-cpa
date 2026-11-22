import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';

const meta: Meta<typeof Text> = {
  title: 'Primitives/Text',
  component: Text,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-169' } },
  args: { children: 'نص تجريبي / Sample text' },
};
export default meta;
type Story = StoryObj<typeof Text>;

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(['lg', 'md', 'sm', 'xs'] as const).map((size) => (
        <Text key={size} size={size}>
          {size} — Body text / نص أساسي
        </Text>
      ))}
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(['regular', 'bold', 'extrabold'] as const).map((weight) => (
        <Text key={weight} weight={weight}>
          {weight} — Almarai / ألمراي
        </Text>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(['body', 'muted', 'strong'] as const).map((tone) => (
        <Text key={tone} tone={tone}>
          {tone}
        </Text>
      ))}
      <div className="bg-bg-inverse p-4 flex flex-col gap-2">
        <Text tone="inverse">inverse</Text>
        <Text tone="inverse-muted">inverse-muted</Text>
      </div>
    </div>
  ),
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-md">
      <Text size="lg">نقدّم خدمات المراجعة والتدقيق والاستشارات المالية بمعايير مهنية عالية وشفافية كاملة مع عملائنا.</Text>
    </div>
  ),
};
