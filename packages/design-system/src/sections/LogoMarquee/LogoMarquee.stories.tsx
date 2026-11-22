import type { Meta, StoryObj } from '@storybook/react-vite';
import { LogoMarquee } from './LogoMarquee';

const meta: Meta<typeof LogoMarquee> = {
  title: 'Sections/LogoMarquee',
  component: LogoMarquee,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=569-5848' } },
};
export default meta;
type Story = StoryObj<typeof LogoMarquee>;

const ph = (n: string) => "data:image/svg+xml," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='120' height='60'><rect width='120' height='60' fill='#dcdedc'/><text x='60' y='35' font-size='14' text-anchor='middle' fill='#164c62'>" + n + "</text></svg>");
const logo = (name: string) => ({ name, image: { src: ph(name), alt: name, width: 120, height: 60 } });
const names = ['Shell', 'BYD', 'SFT', 'Safa', 'Kafaat', 'Lindo', 'Masco', 'TBEA', 'Elyak', 'Dan'];
const rows = [names.slice(0, 5).map(logo), names.slice(5).map(logo)];

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <LogoMarquee label="عملاؤنا" rows={rows} pauseLabel="إيقاف الحركة" />
    </div>
  ),
};

export const English: Story = {
  render: () => <LogoMarquee label="Our clients" rows={rows} pauseLabel="Pause animation" duration={40} />,
};
