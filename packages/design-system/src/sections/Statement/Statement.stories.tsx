import type { Meta, StoryObj } from '@storybook/react-vite';
import { Statement } from './Statement';

const meta: Meta<typeof Statement> = {
  title: 'Sections/Statement',
  component: Statement,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3796' } },
};
export default meta;
type Story = StoryObj<typeof Statement>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-xl">
      <Statement>الشركات المتوسطة تستحق ما تحصل عليه الشركات الكبرى: شريكًا يعرف اسمك، ورأيًا موقّعًا في موعده.</Statement>
    </div>
  ),
};

export const Dark: Story = {
  render: () => (
    <div className="max-w-xl bg-bg-inverse p-8">
      <Statement tone="dark">Mid-sized companies deserve what the big firms get.</Statement>
    </div>
  ),
};
