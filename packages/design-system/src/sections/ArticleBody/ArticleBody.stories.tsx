import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArticleBody } from './ArticleBody';

const meta: Meta<typeof ArticleBody> = {
  title: 'Sections/ArticleBody',
  component: ArticleBody,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=509-3025' } },
};
export default meta;
type Story = StoryObj<typeof ArticleBody>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-3xl">
      <ArticleBody tags={['المراجعة', 'القوائم المالية', 'الامتثال']} tagsLabel="الوسوم">
        <p>المراجعة السنوية لا تبدأ عند وصول المراجع، بل قبلها بأسابيع. المنشآت التي تجهّز ملفاتها مسبقًا تنهي المراجعة أسرع.</p>
        <h2 id="a1">1. رتّب سجلاتك المحاسبية</h2>
        <p>تأكد من إقفال الحسابات الشهرية وتسوية الحسابات البنكية، وكلما كانت التسويات موثّقة قلّ وقت المراجعة.</p>
        <blockquote>
          «كل مستند جاهز قبل البدء يوفّر على فريقك يومًا من الانتظار.»
          <cite>شريك مرخّص · الشبيشيري</cite>
        </blockquote>
        <h2 id="a2">2. جهّز المستندات الداعمة</h2>
        <ul>
          <li>كشوف الحسابات البنكية لكامل السنة المالية</li>
          <li>عقود العملاء والموردين والالتزامات الجوهرية</li>
          <li>سجل الأصول الثابتة وجداول الإهلاك</li>
        </ul>
      </ArticleBody>
    </div>
  ),
};

export const English: Story = {
  render: () => (
    <div className="max-w-3xl">
      <ArticleBody tags={['Audit', 'Compliance']} tagsLabel="Tags">
        <p>The annual audit does not start when the auditor arrives but weeks before.</p>
        <h2 id="e1">1. Organise your accounting records</h2>
        <p>Make sure monthly accounts are closed and bank reconciliations are documented.</p>
        <blockquote>
          Every document ready before we start saves your team a day.
          <cite>Licensed partner</cite>
        </blockquote>
      </ArticleBody>
    </div>
  ),
};
