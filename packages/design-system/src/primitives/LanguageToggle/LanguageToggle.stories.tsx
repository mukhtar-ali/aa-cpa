import type { Meta, StoryObj } from '@storybook/react-vite';
import { LanguageToggle } from './LanguageToggle';

const meta: Meta<typeof LanguageToggle> = {
  title: 'Primitives/LanguageToggle',
  component: LanguageToggle,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=445-40614' } },
  args: { href: '#en', label: 'EN', targetLang: 'en' },
};
export default meta;
type Story = StoryObj<typeof LanguageToggle>;

export const OnDark: Story = {
  render: (args) => (
    <div dir="rtl" lang="ar" className="inline-block bg-bg-hero p-4">
      <LanguageToggle {...args} />
    </div>
  ),
};

export const ArabicTarget: Story = {
  render: () => (
    <div className="inline-block bg-bg-hero p-4">
      <LanguageToggle href="#ar" label="عربي" targetLang="ar" accessibleLabel="التبديل إلى العربية" />
    </div>
  ),
};
