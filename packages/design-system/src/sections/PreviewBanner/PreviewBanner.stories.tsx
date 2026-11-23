import type { Meta, StoryObj } from '@storybook/react-vite';
import { PreviewBanner } from './PreviewBanner';

const meta: Meta<typeof PreviewBanner> = { title: 'Sections/PreviewBanner', component: PreviewBanner, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof PreviewBanner>;

export const English: Story = { args: { message: 'Preview mode: you are viewing unpublished content', exitLabel: 'Exit preview', exitHref: '/api/preview/exit?path=/en' } };
export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <PreviewBanner message="وضع المعاينة: أنت ترى محتوى غير منشور" exitLabel="إنهاء المعاينة" exitHref="/api/preview/exit?path=/ar" />
    </div>
  ),
};
