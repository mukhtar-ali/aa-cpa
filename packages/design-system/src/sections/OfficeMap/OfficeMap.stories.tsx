import type { Meta, StoryObj } from '@storybook/react-vite';
import { OfficeMap } from './OfficeMap';

const meta: Meta<typeof OfficeMap> = {
  title: 'Sections/OfficeMap',
  component: OfficeMap,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=524-3651' } },
};
export default meta;
type Story = StoryObj<typeof OfficeMap>;

const ph = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1140' height='480'%3E%3Crect width='1140' height='480' fill='%23ecf5f9'/%3E%3C/svg%3E";

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-5xl">
      <OfficeMap
        label="مكاتبنا"
        map={{ src: ph, alt: '', width: 1140, height: 480, decorative: true }}
        offices={[
          { city: 'الرياض', address: '', mapHref: '#', coordinates: { x: 45, y: 60 }, isHeadquarters: true },
          { city: 'الخبر', address: '', mapHref: '#', coordinates: { x: 72, y: 45 } },
          { city: 'القصيم', address: '', mapHref: '#', coordinates: { x: 30, y: 38 } },
        ]}
      />
    </div>
  ),
};
