import type { Meta, StoryObj } from '@storybook/react-vite';
import { MobileNav } from './MobileNav';

const meta: Meta<typeof MobileNav> = {
  title: 'Layout/MobileNav',
  component: MobileNav,
  tags: ['autodocs'],
  parameters: {
    design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3807' },
    docs: { description: { component: 'Not in the approved Figma frames: team design that needs client review (FR-031). Record the review in specs/001-design-system/reviews/mobile-nav.md.' } },
  },
};
export default meta;
type Story = StoryObj<typeof MobileNav>;

export const English: Story = {
  args: {
    nav: [
      { label: 'Home', href: '#home', active: true },
      { label: 'About us', href: '#about' },
      { label: 'Services', href: '#services' },
      { label: 'Contact', href: '#contact' },
    ],
    cta: { label: 'Request a quote', href: '#quote' },
    localeSwitch: <a href="#ar">العربية</a>,
    menuLabel: 'Menu',
    closeLabel: 'Close menu',
    navLabel: 'Main navigation',
  },
};

export const ArabicHero: Story = {
  args: {
    nav: [
      { label: 'الرئيسية', href: '#home', active: true },
      { label: 'من نحن', href: '#about' },
      { label: 'خدماتنا', href: '#services' },
      { label: 'تواصل معنا', href: '#contact' },
    ],
    cta: { label: 'أطلب عرض سعر', href: '#quote' },
    localeSwitch: <a href="#en">EN</a>,
    menuLabel: 'القائمة',
    closeLabel: 'إغلاق القائمة',
    navLabel: 'التنقل الرئيسي',
    theme: 'hero',
  },
  render: (args) => (
    <div dir="rtl" lang="ar" className="bg-bg-hero p-6">
      <MobileNav {...args} />
    </div>
  ),
};
