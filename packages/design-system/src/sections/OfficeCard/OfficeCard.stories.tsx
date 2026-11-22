import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapLink, OfficeCard } from './OfficeCard';

const meta: Meta<typeof OfficeCard> = {
  title: 'Sections/OfficeCard',
  component: OfficeCard,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=529-4280' } },
};
export default meta;
type Story = StoryObj<typeof OfficeCard>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="flex max-w-sm flex-col gap-6">
      <OfficeCard office={{ city: 'الرياض – المقر الرئيسي', address: 'حي الصحافة، الرياض 13321', mapHref: '#', mapLabel: 'احصل على الاتجاهات ‹' }} />
      <MapLink href="#" label="عرض الموقع على الخريطة" />
    </div>
  ),
};
