import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = { title: 'Sections/EmptyState', component: EmptyState, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const English: Story = { args: { title: 'Nothing here yet', body: 'Check back later.', action: { label: 'View all services', href: '/en' } } };

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <EmptyState title="عنوان الحالة" body="شرح قصير للحالة وما يمكن فعله." action={{ label: 'العودة إلى الرئيسية', href: '/ar' }} />
    </div>
  ),
};
