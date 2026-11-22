import type { Meta, StoryObj } from '@storybook/react-vite';
import { Testimonial } from './Testimonial';

const meta: Meta<typeof Testimonial> = {
  title: 'Sections/Testimonial',
  component: Testimonial,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3877' } },
};
export default meta;
type Story = StoryObj<typeof Testimonial>;

export const ArabicDark: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="max-w-xl bg-bg-inverse p-8">
      <Testimonial
        ratingLabel="5 من 5"
        testimonial={{
          quote: 'شريك يعرف اسمنا ويسلّم تقريره موقّعًا في موعده، دون طبقات وسيطة ودون مفاجآت.',
          rating: 5,
          name: 'عمر السالم',
          role: 'المدير المالي',
          company: 'شركة نموذجية للمقاولات',
        }}
      />
    </div>
  ),
};

export const EnglishLight: Story = {
  render: () => (
    <div className="max-w-xl p-8">
      <Testimonial
        tone="light"
        ratingLabel="5 of 5"
        testimonial={{ quote: 'A partner who knows our name and signs on time.', rating: 5, name: 'Omar Al-Salem', role: 'Chief Financial Officer', company: 'Sample Contracting Co.' }}
      />
    </div>
  ),
};
