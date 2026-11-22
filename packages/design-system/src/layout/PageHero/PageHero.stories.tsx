import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageHero } from './PageHero';

const meta: Meta<typeof PageHero> = {
  title: 'Layout/PageHero',
  component: PageHero,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=445-40591' } },
};
export default meta;
type Story = StoryObj<typeof PageHero>;

// Neutral licence-free placeholder (an inline SVG gradient); real pages pass a photo.
const placeholder = {
  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1512' height='420'%3E%3Crect width='1512' height='420' fill='%23566157'/%3E%3C/svg%3E",
  alt: '',
  width: 1512,
  height: 420,
  decorative: true,
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <PageHero
        title="مرخّصون، محليّون، ومسؤولون بالاسم"
        subtitle="الشركة التي تلجأ إليها المنشآت السعودية حين تتجاوز قدرة المحاسب الفردي، وترفض أن تكون رقمًا في هيكل تنظيمي."
        image={placeholder}
      />
    </div>
  ),
};

export const WithBreadcrumbsAndAction: Story = {
  render: () => (
    <PageHero
      title="External audit"
      subtitle="Partner-led audits that banks and boards rely on."
      image={placeholder}
      breadcrumbs={[
        { label: 'Home', href: '#' },
        { label: 'Services', href: '#' },
        { label: 'External audit', href: '#' },
      ]}
      breadcrumbsLabel="Breadcrumb"
      action={{ label: 'Request a quote', href: '#' }}
    />
  ),
};
