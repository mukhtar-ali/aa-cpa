import { markSanitizedHtml } from '../../lib/sanitized-html';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LegalDocument } from './LegalDocument';

const meta: Meta<typeof LegalDocument> = {
  title: 'Sections/LegalDocument',
  component: LegalDocument,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=525-3854' } },
};
export default meta;
type Story = StoryObj<typeof LegalDocument>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="mx-auto max-w-285 bg-bg-page p-8">
      <LegalDocument
        labels={{ tocTitle: 'في هذه الصفحة', tocLabel: 'فهرس الصفحة', updated: 'آخر تحديث', summary: 'ملخص', helpTitle: 'لديك سؤال؟', helpBody: 'راسلنا وسنجيبك خلال يومي عمل.', download: 'تنزيل PDF' }}
        document={{
          updatedAt: '2026-09-01',
          summary: ['نجمع فقط ما نحتاجه لخدمتك.', 'يمكنك طلب حذف بياناتك في أي وقت.'],
          sections: [
            { id: 'collect', title: 'ما الذي نجمعه', html: markSanitizedHtml('<p>الاسم والبريد الإلكتروني ورقم الجوال.</p>') },
            { id: 'use', title: 'كيف نستخدمه', html: markSanitizedHtml('<p>للرد على طلبك.</p><ul><li>الرد على الاستفسار</li><li>إعداد عرض السعر</li></ul>') },
          ],
          downloadHref: '#',
        }}
      />
    </div>
  ),
};
