import type { Meta, StoryObj } from '@storybook/react-vite';
import { ServiceCard } from './ServiceCard';

const meta: Meta<typeof ServiceCard> = {
  title: 'Sections/ServiceCard',
  component: ServiceCard,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=448-41771' } },
};
export default meta;
type Story = StoryObj<typeof ServiceCard>;

const ph = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='429' height='336'%3E%3Crect width='429' height='336' fill='%23566157'/%3E%3C/svg%3E";
const image = { src: ph, alt: '', width: 429, height: 336, decorative: true };

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="bg-bg-page p-8">
      <ServiceCard service={{ id: 'local', title: 'مراجعة وشهادة المحتوى المحلي', summary: 'عزّز نسبة المحتوى المحلي لمنشأتك وافتح أبواب المنافسة على العقود الحكومية، بخطوات مبسطة، مدقّقة، ومعتمدة.', image, href: '#', ctaLabel: 'تعرف على الخدمة' }} />
    </div>
  ),
};

export const English: Story = {
  render: () => (
    <div className="bg-bg-page p-8">
      <ServiceCard service={{ id: 'audit', title: 'External audit and quality assurance', summary: 'Audit reports ready for banks and boards, reviewed directly by a licensed partner.', image, href: '#', ctaLabel: 'Learn about the service' }} />
    </div>
  ),
};
