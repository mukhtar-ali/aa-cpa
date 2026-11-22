import type { Meta, StoryObj } from '@storybook/react-vite';
import { PerkTile } from './PerkTile';

const meta: Meta<typeof PerkTile> = {
  title: 'Sections/PerkTile',
  component: PerkTile,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=529-4296' } },
};
export default meta;
type Story = StoryObj<typeof PerkTile>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="grid max-w-3xl gap-4 sm:grid-cols-2">
      <PerkTile perk={{ title: 'راتب تنافسي', body: 'ومكافأة سنوية مرتبطة بالأداء' }} />
      <PerkTile perk={{ title: 'تطوير مهني', body: 'برامج تدريب ومسار واضح للترقي', icon: 'award' }} />
    </div>
  ),
};
