import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3807' },
    viewport: {
      options: {
        w360: { name: 'Phone 360', styles: { width: '360px', height: '740px' } },
        w768: { name: 'Tablet 768', styles: { width: '768px', height: '900px' } },
        w1024: { name: 'Laptop 1024', styles: { width: '1024px', height: '768px' } },
        w1512: { name: 'Desktop 1512', styles: { width: '1512px', height: '900px' } },
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Header>;

const logo = <a href="/" className="text-h5 font-bold">AA-CPA</a>;
const en = {
  logo,
  nav: [
    { label: 'Home', href: '#home', active: true },
    { label: 'About us', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Sectors', href: '#sectors' },
    { label: 'Articles', href: '#articles' },
    { label: 'Contact', href: '#contact' },
  ],
  cta: { label: 'Request a quote', href: '#quote' },
  localeSwitch: <a href="#ar" className="text-body-md font-bold">العربية</a>,
  menuLabel: 'Menu',
  closeLabel: 'Close menu',
  navLabel: 'Main navigation',
};
const ar = {
  logo,
  nav: [
    { label: 'الرئيسية', href: '#home', active: true },
    { label: 'من نحن', href: '#about' },
    { label: 'خدماتنا', href: '#services' },
    { label: 'القطاعات', href: '#sectors' },
    { label: 'المقالات', href: '#articles' },
    { label: 'تواصل معنا', href: '#contact' },
  ],
  cta: { label: 'أطلب عرض سعر', href: '#quote' },
  localeSwitch: <a href="#en" className="text-body-md font-bold">EN</a>,
  menuLabel: 'القائمة',
  closeLabel: 'إغلاق القائمة',
  navLabel: 'التنقل الرئيسي',
};

export const SolidEnglish: Story = { args: { ...en, theme: 'solid' } };

export const HeroArabic: Story = {
  args: { ...ar, theme: 'hero' },
  render: (args) => (
    <div dir="rtl" lang="ar" className="bg-bg-hero">
      <Header {...args} />
      <div className="h-64" />
    </div>
  ),
};

export const Phone360: Story = {
  args: { ...ar, theme: 'solid' },
  globals: { viewport: { value: 'w360', isRotated: false } },
  render: (args) => (
    <div dir="rtl" lang="ar">
      <Header {...args} />
    </div>
  ),
};

export const Tablet768: Story = {
  args: { ...ar, theme: 'solid' },
  globals: { viewport: { value: 'w768', isRotated: false } },
  render: (args) => (
    <div dir="rtl" lang="ar">
      <Header {...args} />
    </div>
  ),
};

export const Laptop1024: Story = {
  args: { ...ar, theme: 'solid' },
  globals: { viewport: { value: 'w1024', isRotated: false } },
  render: (args) => (
    <div dir="rtl" lang="ar">
      <Header {...args} />
    </div>
  ),
};

export const Desktop1512: Story = {
  args: { ...ar, theme: 'hero' },
  globals: { viewport: { value: 'w1512', isRotated: false } },
  render: (args) => (
    <div dir="rtl" lang="ar" className="bg-bg-hero">
      <Header {...args} />
      <div className="h-64" />
    </div>
  ),
};
