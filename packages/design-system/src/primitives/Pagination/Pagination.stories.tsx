import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Primitives/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=530-4416' } },
};
export default meta;
type Story = StoryObj<typeof Pagination>;

const en = { nav: 'Pagination', previous: 'Previous page', next: 'Next page', page: (n: number) => 'Page ' + n };
const ar = { nav: 'التنقل بين الصفحات', previous: 'الصفحة السابقة', next: 'الصفحة التالية', page: (n: number) => 'الصفحة ' + n };

export const Short: Story = {
  args: { page: 2, pageCount: 5, hrefFor: (n: number) => '#page-' + n, labels: en },
};

export const Long: Story = {
  args: { page: 10, pageCount: 20, hrefFor: (n: number) => '#page-' + n, labels: en },
};

export const Arabic: Story = {
  args: { page: 3, pageCount: 8, hrefFor: (n: number) => '#page-' + n, labels: ar },
  render: (args) => (
    <div dir="rtl" lang="ar">
      <Pagination {...args} />
    </div>
  ),
};
