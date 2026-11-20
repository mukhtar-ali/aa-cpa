import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumbs } from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Primitives/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=506-2706' } },
};
export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Light: Story = {
  args: {
    label: 'Breadcrumb',
    items: [
      { label: 'Home', href: '#' },
      { label: 'Articles', href: '#' },
      { label: 'How AI changes auditing', href: '#' },
    ],
  },
};

export const DarkArabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="bg-bg-hero p-6">
      <Breadcrumbs
        tone="dark"
        label="مسار التنقل"
        items={[
          { label: 'الرئيسية', href: '#' },
          { label: 'المقالات', href: '#' },
          { label: 'كيف يغيّر الذكاء الاصطناعي عمل مراجع الحسابات؟', href: '#' },
        ]}
      />
    </div>
  ),
};
