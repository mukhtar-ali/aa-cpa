import type { Meta, StoryObj } from '@storybook/react-vite';
import { JobRow, JobSummaryCard } from './JobRow';

const meta: Meta<typeof JobRow> = {
  title: 'Sections/JobRow',
  component: JobRow,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=512-1159' } },
};
export default meta;
type Story = StoryObj<typeof JobRow>;

const job = { id: 'j1', title: 'مراجع حسابات أول', department: 'المراجعة', city: 'الرياض', contract: 'دوام كامل', experience: '5 سنوات فأكثر', postedAt: '2026-10-01', closesAt: '2026-11-15', href: '#' };

export const ArabicList: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="flex max-w-5xl flex-col gap-4">
      <JobRow job={job} detailsLabel="عرض التفاصيل" />
      <JobRow job={{ ...job, id: 'j2', title: 'محاسب ضرائب' }} detailsLabel="عرض التفاصيل" />
    </div>
  ),
};

export const SummaryCard: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-sm">
      <JobSummaryCard job={job} labels={{ department: 'القسم', city: 'المدينة', contract: 'نوع الدوام', experience: 'الخبرة', postedAt: 'تاريخ النشر', closesAt: 'آخر موعد' }} />
    </div>
  ),
};
