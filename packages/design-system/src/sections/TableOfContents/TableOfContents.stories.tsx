import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableOfContents } from './TableOfContents';

const meta: Meta<typeof TableOfContents> = {
  title: 'Sections/TableOfContents',
  component: TableOfContents,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=506-4001' } },
};
export default meta;
type Story = StoryObj<typeof TableOfContents>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-sm">
      <TableOfContents
        title="في هذه المقالة"
        label="فهرس المقالة"
        items={[
          { id: 'a1', label: 'رتّب سجلاتك المحاسبية' },
          { id: 'a2', label: 'جهّز المستندات الداعمة' },
          { id: 'a3', label: 'حدّد شخصًا واحدًا للتواصل' },
          { id: 'a4', label: 'الخلاصة' },
        ]}
      />
    </div>
  ),
};

export const English: Story = {
  render: () => (
    <div className="max-w-sm">
      <TableOfContents title="In this article" label="Table of contents" locale="en" items={[{ id: 'e1', label: 'Organise your records' }, { id: 'e2', label: 'Prepare supporting documents' }, { id: 'e3', label: 'Summary' }]} />
    </div>
  ),
};
