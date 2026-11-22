import type { Meta, StoryObj } from '@storybook/react-vite';
import { GapSection } from './GapSection';

const meta: Meta<typeof GapSection> = {
  title: 'Sections/GapSection',
  component: GapSection,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3788' } },
};
export default meta;
type Story = StoryObj<typeof GapSection>;

const ph = (w: number, h: number) => "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h + "'%3E%3Crect width='" + w + "' height='" + h + "' fill='%23566157'/%3E%3C/svg%3E";
const images: [{ src: string; alt: string; width: number; height: number; decorative: boolean }, { src: string; alt: string; width: number; height: number; decorative: boolean }] = [
  { src: ph(220, 181), alt: '', width: 220, height: 181, decorative: true },
  { src: ph(315, 415), alt: '', width: 315, height: 415, decorative: true },
];

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <GapSection
        statement="الشركات المتوسطة تستحق ما تحصل عليه الشركات الكبرى: شريكًا يعرف اسمك، ورأيًا موقّعًا في موعده، ومعايير لا تتنازل."
        eyebrow="الفجوة التي نملؤها"
        body="تصل معظم المنشآت إلى مرحلة لم يعد فيها المحاسب المحلي قادرًا على اعتماد ما يطلبه البنك، ويأتي عرض الشركات العالمية الكبرى بتكلفة مرتفعة وقائمة انتظار تمتد لأشهر. تأسست شركتنا لتغطية هذه الفجوة تحديدًا."
        images={images}
      />
    </div>
  ),
};

export const English: Story = {
  render: () => (
    <GapSection
      statement="Mid-sized companies deserve what the big firms get: a partner who knows your name, an opinion signed on time, and standards that do not bend."
      eyebrow="The gap we fill"
      body="Most companies reach a stage where the local accountant can no longer sign what the bank asks for, and a global firm means high fees and months of waiting. We were founded to close exactly that gap."
      images={images}
    />
  ),
};
