import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormErrorSummary } from './FormErrorSummary';

const meta: Meta<typeof FormErrorSummary> = {
  title: 'Forms/FormErrorSummary',
  component: FormErrorSummary,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=522-1185' } },
};
export default meta;
type Story = StoryObj<typeof FormErrorSummary>;

export const English: Story = {
  args: {
    title: 'Please fix the following',
    errors: [
      { id: 'name', message: 'Enter your name' },
      { id: 'email', message: 'Enter a valid email' },
    ],
  },
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <FormErrorSummary
        title="يرجى تصحيح ما يلي"
        errors={[
          { id: 'name', message: 'أدخل اسمك' },
          { id: 'email', message: 'أدخل بريدًا إلكترونيًا صحيحًا' },
        ]}
      />
    </div>
  ),
};
