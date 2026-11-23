import type { Meta, StoryObj } from '@storybook/react-vite';
import { ErrorState } from './ErrorState';

const meta: Meta<typeof ErrorState> = { title: 'Sections/ErrorState', component: ErrorState, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof ErrorState>;

export const English: Story = { args: { title: 'Something went wrong', body: 'We could not load this page.', action: { label: 'Back to home', href: '/en' } } };

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <ErrorState title="عنوان الحالة" body="شرح قصير للحالة وما يمكن فعله." action={{ label: 'العودة إلى الرئيسية', href: '/ar' }} />
    </div>
  ),
};
