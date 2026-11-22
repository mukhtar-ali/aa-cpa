import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  title: 'Layout/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3881' } },
};
export default meta;
type Story = StoryObj<typeof Footer>;

const logo = <a href="/" className="text-h5 font-bold">AA-CPA</a>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <Footer
        logo={logo}
        description="مراجعة يقودها الشركاء، بدقة يدعمها الذكاء الاصطناعي. ترخيص SOCPA رقم 522، وعضو في شبكة 3E Accounting العالمية."
        socialsLabel="وسائل التواصل الاجتماعي"
        socials={[
          { network: 'linkedin', href: '#', label: 'لينكدإن' },
          { network: 'x', href: '#', label: 'إكس' },
          { network: 'instagram', href: '#', label: 'إنستغرام' },
        ]}
        columns={[
          { title: 'روابط سريعة', links: ['الرئيسية', 'من نحن', 'خدماتنا', 'القطاعات', 'المقالات', 'تواصل معنا'].map((label) => ({ label, href: '#' })) },
          { title: 'خدماتنا', links: ['المراجعة الخارجية', 'الاستشارات المهنية', 'مراجعة المحتوى المحلي', 'الخدمات الضريبية'].map((label) => ({ label, href: '#' })) },
          { title: 'مكاتبنا', links: ['الرياض', 'الخبر', 'القصيم'].map((label) => ({ label, href: '#' })) },
        ]}
        contacts={[
          { type: 'phone', label: 'الهاتف', value: '+966 55 534 6560' },
          { type: 'email', label: 'البريد الإلكتروني', value: 'info@aacpa.sa' },
        ]}
        legal={{
          copyright: '© 2026 مكتب عبدالرحمن الشبيشيري للاستشارات المهنية. ترخيص رقم 522. عضو شبكة 3E Accounting.',
          registry: ['السجل التجاري: 1010469357', 'الرقم الضريبي: 310456789200003'],
          links: [{ label: 'سياسة الخصوصية', href: '#' }],
        }}
        backToTopLabel="إلى الأعلى"
        wordmark="الشبيشيري"
      />
    </div>
  ),
};

export const English: Story = {
  render: () => (
    <Footer
      logo={logo}
      description="Partner-led audit, backed by AI precision. SOCPA licence No. 522, member of the 3E Accounting network."
      socialsLabel="Social media"
      socials={[
        { network: 'linkedin', href: '#', label: 'LinkedIn' },
        { network: 'x', href: '#', label: 'X' },
        { network: 'instagram', href: '#', label: 'Instagram' },
      ]}
      columns={[
        { title: 'Quick links', links: ['Home', 'About us', 'Services', 'Sectors', 'Articles', 'Contact'].map((label) => ({ label, href: '#' })) },
        { title: 'Services', links: ['External audit', 'Advisory', 'Local content review', 'Tax services'].map((label) => ({ label, href: '#' })) },
        { title: 'Offices', links: ['Riyadh', 'Khobar', 'Qassim'].map((label) => ({ label, href: '#' })) },
      ]}
      contacts={[
        { type: 'phone', label: 'Phone', value: '+966 55 534 6560' },
        { type: 'email', label: 'Email', value: 'info@aacpa.sa' },
      ]}
      legal={{
        copyright: '© 2026 AA-CPA Professional Consulting. Licence No. 522. Member of 3E Accounting.',
        registry: ['CR: 1010469357', 'VAT: 310456789200003'],
        links: [{ label: 'Privacy policy', href: '#' }],
      }}
      backToTopLabel="Back to top"
      wordmark="ALSHABIBSHIRI"
    />
  ),
};
