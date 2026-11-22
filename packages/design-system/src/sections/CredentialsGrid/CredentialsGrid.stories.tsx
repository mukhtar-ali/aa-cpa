import type { Meta, StoryObj } from '@storybook/react-vite';
import { CredentialsGrid } from './CredentialsGrid';

const meta: Meta<typeof CredentialsGrid> = {
  title: 'Sections/CredentialsGrid',
  component: CredentialsGrid,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=585-6030' } },
};
export default meta;
type Story = StoryObj<typeof CredentialsGrid>;

const ph = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='124' height='80'%3E%3Crect width='124' height='80' fill='%23dcdedc'/%3E%3C/svg%3E";
const logos = [
  { name: 'SOCPA', image: { src: ph, alt: 'SOCPA', width: 124, height: 80 } },
  { name: '3E Accounting', image: { src: ph, alt: '3E Accounting', width: 124, height: 80 } },
  { name: 'p3', placeholder: true },
  { name: 'p4', placeholder: true },
  { name: 'p5', placeholder: true },
];

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <CredentialsGrid title="موثقون لدى" description="نعمل وفق تراخيص واعتمادات الجهات الرسمية، وعضوية شبكات مهنية دولية." logos={logos} showPlaceholders placeholderLabel="شعار الجهة" />
    </div>
  ),
};

export const EnglishWithoutPlaceholders: Story = {
  render: () => <CredentialsGrid title="Accredited by" description="We work under official licences and international memberships." logos={logos} />,
};
