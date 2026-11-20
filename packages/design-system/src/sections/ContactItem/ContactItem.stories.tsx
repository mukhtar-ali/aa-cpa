import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContactItem } from './ContactItem';

const meta: Meta<typeof ContactItem> = {
  title: 'Sections/ContactItem',
  component: ContactItem,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=527-5423' } },
};
export default meta;
type Story = StoryObj<typeof ContactItem>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="flex flex-col gap-6">
      <ContactItem channel={{ type: 'phone', label: 'الهاتف', value: '+966 55 534 6560' }} />
      <ContactItem channel={{ type: 'email', label: 'البريد الإلكتروني', value: 'info@aacpa.sa' }} />
      <ContactItem channel={{ type: 'whatsapp', label: 'واتساب', value: '+966 55 534 6560' }} />
      <ContactItem channel={{ type: 'hours', label: 'ساعات العمل', value: 'الأحد إلى الخميس، 9 ص إلى 5 م' }} />
    </div>
  ),
};
