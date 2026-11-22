import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectorIndex } from './SectorIndex';

const meta: Meta<typeof SectorIndex> = {
  title: 'Sections/SectorIndex',
  component: SectorIndex,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=547-4555' } },
};
export default meta;
type Story = StoryObj<typeof SectorIndex>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-5xl">
      <SectorIndex
        label="القطاعات التي نخدمها"
        sectors={[
          { id: 'c', title: 'المقاولات والإنشاءات', summary: 'محاسبة المشاريع ومراجعة حسابات المقاولين.', href: '#' },
          { id: 'r', title: 'العقار والتطوير', summary: 'مراجعة وتقارير للمطورين والصناديق العقارية.', href: '#' },
          { id: 'i', title: 'الصناعة والتصنيع', summary: 'تكاليف الإنتاج والمخزون والمحتوى المحلي.' },
        ]}
      />
    </div>
  ),
};
