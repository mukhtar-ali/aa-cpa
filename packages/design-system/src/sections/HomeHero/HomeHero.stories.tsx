import type { Meta, StoryObj } from '@storybook/react-vite';
import { HomeHero } from './HomeHero';

const meta: Meta<typeof HomeHero> = {
  title: 'Sections/HomeHero',
  component: HomeHero,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3702' } },
};
export default meta;
type Story = StoryObj<typeof HomeHero>;

const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='630' height='498'%3E%3Crect width='630' height='498' fill='%23566157'/%3E%3C/svg%3E";
const image = { src: placeholder, alt: '', width: 630, height: 498, decorative: true };

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <HomeHero
        title="مراجعة يقودها الشركاء، بدقة يدعمها الذكاء الاصطناعي."
        body="تجمع شركة عبدالرحمن الشبيشيري للاستشارات المهنية بين خبرة شركاء مرخّصين وتقنيات مراجعة ذكية، لتقدّم لك دقة الشركات العالمية الكبرى بسرعة شريك محلي مباشر."
        actions={[
          { label: 'أعرف المزيد', href: '#' },
          { label: 'خدماتنا', href: '#' },
        ]}
        image={image}
      />
    </div>
  ),
};

export const English: Story = {
  render: () => (
    <HomeHero
      title="Partner-led audit, backed by AI precision."
      body="We combine licensed partners with smart audit technology, giving you big-firm precision at the speed of a direct local partner."
      actions={[
        { label: 'Learn more', href: '#' },
        { label: 'Our services', href: '#' },
      ]}
      image={image}
    />
  ),
};
