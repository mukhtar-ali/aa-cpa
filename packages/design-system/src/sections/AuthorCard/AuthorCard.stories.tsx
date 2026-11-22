import type { Meta, StoryObj } from '@storybook/react-vite';
import { AuthorCard } from './AuthorCard';

const meta: Meta<typeof AuthorCard> = {
  title: 'Sections/AuthorCard',
  component: AuthorCard,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=506-4076' } },
};
export default meta;
type Story = StoryObj<typeof AuthorCard>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-sm">
      <AuthorCard author={{ name: 'فريق الشبيشيري', role: 'شركاء مرخّصون', bio: 'نكتب بلغة واضحة عن المراجعة والضريبة والزكاة، ليستفيد أصحاب المنشآت وفريقهم المالي.' }} />
    </div>
  ),
};

export const English: Story = {
  render: () => (
    <div className="max-w-sm">
      <AuthorCard author={{ name: 'Al-Shabibshiri team', role: 'Licensed partners', bio: 'We write plainly about audit, tax and zakat for business owners and their finance teams.' }} />
    </div>
  ),
};
