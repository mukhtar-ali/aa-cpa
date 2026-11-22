import type { Meta, StoryObj } from '@storybook/react-vite';
import { UtilityBar } from './UtilityBar';
import { LanguageToggle } from '../../primitives/LanguageToggle';

const meta: Meta<typeof UtilityBar> = {
  title: 'Layout/UtilityBar',
  component: UtilityBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=445-40612' } },
};
export default meta;
type Story = StoryObj<typeof UtilityBar>;

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <UtilityBar
        license="ترخيص الهيئة السعودية للمراجعين والمحاسبين SOCPA رقم 522"
        network="عضو مستقل في شبكة 3E Accounting العالمية (80+ دولة)"
        city="الرياض · القصيم"
        phone={{ type: 'phone', label: 'الهاتف', value: '+966 55 534 6560' }}
        localeSwitch={<LanguageToggle href="#en" label="EN" targetLang="en" />}
      />
    </div>
  ),
};

export const English: Story = {
  render: () => (
    <UtilityBar
      license="SOCPA licence No. 522"
      network="Independent member of 3E Accounting (80+ countries)"
      city="Riyadh · Qassim"
      phone={{ type: 'phone', label: 'Phone', value: '+966 55 534 6560' }}
      localeSwitch={<LanguageToggle href="#ar" label="عربي" targetLang="ar" accessibleLabel="التبديل إلى العربية" />}
    />
  ),
};
