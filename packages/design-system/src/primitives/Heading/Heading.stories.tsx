import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading, type HeadingSize } from './Heading';

const meta: Meta<typeof Heading> = {
  title: 'Primitives/Heading',
  component: Heading,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-169' } },
  args: { level: 2, children: 'Heading' },
};
export default meta;
type Story = StoryObj<typeof Heading>;

const sizes: HeadingSize[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {sizes.map((size) => (
        <Heading key={size} level={2} size={size}>
          {size.toUpperCase()} — Almarai Bold / رأس الصفحة
        </Heading>
      ))}
    </div>
  ),
};

export const WithAccentLine: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Heading level={1} accent="Accent line (gradient, h1-h3)">
        Main heading
      </Heading>
      <Heading level={2} size="h5" accent="Small accent (solid colour)">
        Smaller heading
      </Heading>
    </div>
  ),
};

export const Inverse: Story = {
  render: () => (
    <div className="bg-bg-inverse p-8">
      <Heading level={2} tone="inverse">
        Heading on dark
      </Heading>
    </div>
  ),
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="flex flex-col gap-4">
      <Heading level={1} accent="نمو يعتمد على الثقة">
        شريكك في التدقيق والمراجعة
      </Heading>
      <Heading level={3}>خدماتنا المهنية</Heading>
    </div>
  ),
};

export const LongText: Story = {
  render: () => (
    <div className="max-w-md">
      <Heading level={2}>A very long heading that has to wrap across several lines without breaking the layout or clipping</Heading>
    </div>
  ),
};
