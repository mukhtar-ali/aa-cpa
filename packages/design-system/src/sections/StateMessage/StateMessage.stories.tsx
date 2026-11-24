import type { Meta, StoryObj } from '@storybook/react-vite';
import { StateMessage } from './StateMessage';

const meta: Meta<typeof StateMessage> = { title: 'Sections/StateMessage', component: StateMessage, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof StateMessage>;

export const English: Story = { args: { eyebrow: '404', title: 'Page not found', body: 'The page may have moved or the link is wrong.', action: { label: 'Back to home', href: '/en' } } };

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <StateMessage eyebrow="404" title="الصفحة غير موجودة" body="ربما نُقلت الصفحة أو أن الرابط غير صحيح." action={{ label: 'العودة إلى الرئيسية', href: '/ar' }} />
    </div>
  ),
};
