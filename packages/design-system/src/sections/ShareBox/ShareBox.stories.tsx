import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShareBox } from './ShareBox';

const meta: Meta<typeof ShareBox> = {
  title: 'Sections/ShareBox',
  component: ShareBox,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=506-3982' } },
};
export default meta;
type Story = StoryObj<typeof ShareBox>;

const en = { copyLink: 'Copy link', whatsapp: 'Share on WhatsApp', linkedin: 'Share on LinkedIn', x: 'Share on X', copy: 'Copy', copied: 'Link copied' };
const ar = { copyLink: 'نسخ الرابط', whatsapp: 'مشاركة عبر واتساب', linkedin: 'مشاركة عبر لينكدإن', x: 'مشاركة عبر إكس', copy: 'نسخ', copied: 'تم نسخ الرابط' };

export const BarArabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-2xl">
      <ShareBox url="https://aacpa.sa/news/annual-audit" title="أعجبك المقال؟ شاركه مع زملائك" description="ساعدهم على الاستعداد للمراجعة." labels={ar} />
    </div>
  ),
};

export const CardEnglish: Story = {
  render: () => (
    <div className="max-w-sm">
      <ShareBox variant="card" url="https://aacpa.sa/news/annual-audit" title="Share the article" labels={en} />
    </div>
  ),
};
