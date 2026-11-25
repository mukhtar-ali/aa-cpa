import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConsentBanner } from './ConsentBanner';

const meta: Meta<typeof ConsentBanner> = {
  title: 'Layout/ConsentBanner',
  component: ConsentBanner,
  tags: ['autodocs'],
  args: {
    open: true,
    texts: {
      title: 'Cookies & Privacy',
      description:
        'We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. You can choose to accept all, reject non-essential cookies, or manage your preferences.',
      acceptAll: 'Accept all',
      rejectAll: 'Reject non-essential',
      customize: 'Preferences',
    },
    onAcceptAll: () => console.log('Accept all clicked'),
    onRejectAll: () => console.log('Reject all clicked'),
    onCustomize: () => console.log('Customize clicked'),
  },
};

export default meta;
type Story = StoryObj<typeof ConsentBanner>;

export const English: Story = {
  render: (args) => (
    <div className="relative min-h-[300px] bg-bg-page p-6">
      <ConsentBanner {...args} />
    </div>
  ),
};

export const Arabic: Story = {
  render: (args) => (
    <div dir="rtl" lang="ar" className="relative min-h-[300px] bg-bg-page p-6">
      <ConsentBanner
        {...args}
        texts={{
          title: 'ملفات تعريف الارتباط والخصوصية',
          description:
            'نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وتحليل حركة الموقع والمساعدة في جهود التسويق. يمكنك قبول الجميع، رفض غير الأساسية، أو تخصيص التفضيلات.',
          acceptAll: 'قبول الكل',
          rejectAll: 'رفض غير الأساسية',
          customize: 'تخصيص الخيارات',
        }}
      />
    </div>
  ),
};
