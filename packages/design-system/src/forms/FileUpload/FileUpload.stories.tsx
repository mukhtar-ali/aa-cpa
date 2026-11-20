import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileUpload, type FileUploadMessages } from './FileUpload';

const meta: Meta<typeof FileUpload> = {
  title: 'Forms/FileUpload',
  component: FileUpload,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=522-1214' } },
};
export default meta;
type Story = StoryObj<typeof FileUpload>;

const en: FileUploadMessages = {
  prompt: 'Drag your CV here or',
  promptAction: 'choose a file',
  hint: 'PDF or DOCX, up to 5 MB',
  uploaded: (f) => Math.round(f.size / 1024) + ' KB · uploaded successfully',
  remove: 'Remove file',
  tooLarge: () => 'The file is larger than 5 MB',
  wrongType: () => 'Only PDF or DOCX files are accepted',
};
const ar: FileUploadMessages = {
  prompt: 'اسحب ملف السيرة الذاتية هنا أو',
  promptAction: 'اختر ملفًا',
  hint: 'PDF أو DOCX، حتى 5 ميجابايت',
  uploaded: (f) => Math.round(f.size / 1024) + ' كيلوبايت · تم الرفع بنجاح',
  remove: 'إزالة الملف',
  tooLarge: () => 'حجم الملف أكبر من 5 ميجابايت',
  wrongType: () => 'يُقبل فقط ملف PDF أو DOCX',
};

function Demo({ messages, initial }: { messages: FileUploadMessages; initial?: File }) {
  const [file, setFile] = React.useState<File | null>(initial ?? null);
  return <FileUpload id="cv" label="CV" file={file} onFileChange={setFile} accept={['.pdf', '.docx']} messages={messages} />;
}

export const Empty: Story = { render: () => <Demo messages={en} /> };

export const Uploaded: Story = {
  render: () => <Demo messages={en} initial={new File([new Uint8Array(240 * 1024)], 'CV_Mohammed_Alotaibi.pdf', { type: 'application/pdf' })} />,
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="flex flex-col gap-6">
      <Demo messages={ar} />
      <Demo messages={ar} initial={new File([new Uint8Array(240 * 1024)], 'CV_Mohammed_Alotaibi.pdf', { type: 'application/pdf' })} />
    </div>
  ),
};
