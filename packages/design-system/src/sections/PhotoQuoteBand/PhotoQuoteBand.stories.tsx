import type { Meta, StoryObj } from '@storybook/react-vite';
import { PhotoQuoteBand } from './PhotoQuoteBand';

const meta: Meta<typeof PhotoQuoteBand> = {
  title: 'Sections/PhotoQuoteBand',
  component: PhotoQuoteBand,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3846' } },
};
export default meta;
type Story = StoryObj<typeof PhotoQuoteBand>;

const ph = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='720' height='640'%3E%3Crect width='720' height='640' fill='%23566157'/%3E%3C/svg%3E";
const image = { src: ph, alt: '', width: 720, height: 640, decorative: true };

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <PhotoQuoteBand title={'شريك واحد، من أول ملف\nحتى توقيع التقرير.'} body="لا وسيط بينك وبين من يوقّع. يقرأ ملفك، ويناقشك فيه، ويوقّع عليه بنفسه." action={{ label: 'أطلب عرض سعر', href: '#' }} image={image} />
    </div>
  ),
};

export const English: Story = {
  render: () => <PhotoQuoteBand title={'One partner, from the first file\nto the signed report.'} body="No middleman between you and the signer." action={{ label: 'Request a quote', href: '#' }} image={image} />,
};
