import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormSuccess } from './FormSuccess';

const meta: Meta<typeof FormSuccess> = { title: 'Sections/FormSuccess', component: FormSuccess, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof FormSuccess>;

export const English: Story = { args: { title: 'Sent', body: 'Thank you.', action: { label: 'Back to home', href: '/en' } } };

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <FormSuccess title="عنوان الحالة" body="شرح قصير للحالة وما يمكن فعله." action={{ label: 'العودة إلى الرئيسية', href: '/ar' }} />
    </div>
  ),
};
