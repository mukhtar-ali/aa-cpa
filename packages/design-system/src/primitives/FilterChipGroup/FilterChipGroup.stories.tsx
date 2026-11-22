import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilterChipGroup } from './FilterChipGroup';

const meta: Meta<typeof FilterChipGroup> = {
  title: 'Primitives/FilterChipGroup',
  component: FilterChipGroup,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=499-1149' } },
};
export default meta;
type Story = StoryObj<typeof FilterChipGroup>;

function Demo({ items, label }: { items: { value: string; label: string }[]; label: string }) {
  const [value, setValue] = React.useState(items[0]?.value ?? '');
  return <FilterChipGroup label={label} items={items} value={value} onValueChange={setValue} />;
}

export const English: Story = {
  render: () => (
    <Demo
      label="Filter by category"
      items={[
        { value: 'all', label: 'All' },
        { value: 'audit', label: 'Audit' },
        { value: 'tax', label: 'Tax' },
        { value: 'advisory', label: 'Advisory' },
      ]}
    />
  ),
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <Demo
        label="تصفية حسب التصنيف"
        items={[
          { value: 'all', label: 'الكل' },
          { value: 'audit', label: 'مراجعة' },
          { value: 'tax', label: 'ضرائب' },
          { value: 'advisory', label: 'استشارات' },
        ]}
      />
    </div>
  ),
};
