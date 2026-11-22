import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from './Field';
import { TextInput } from '../TextInput';
import { Textarea } from '../Textarea';
import { Select } from '../Select';

const meta: Meta<typeof Field> = {
  title: 'Forms/Field and controls',
  component: Field,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=522-1185' } },
};
export default meta;
type Story = StoryObj<typeof Field>;

export const States: Story = {
  render: () => (
    <div className="flex max-w-lg flex-col gap-6">
      <Field id="s-default" label="Full name">
        <TextInput placeholder="Your name" />
      </Field>
      <Field id="s-filled" label="Full name (filled)" help="Helper text">
        <TextInput defaultValue="Mohammed Alotaibi" />
      </Field>
      <Field id="s-required" label="Email" required>
        <TextInput type="email" placeholder="name@example.com" />
      </Field>
      <Field id="s-error" label="Mobile" error="Enter a valid Saudi mobile number" required>
        <TextInput defaultValue="123" />
      </Field>
      <Field id="s-disabled" label="Disabled">
        <TextInput disabled defaultValue="Read only" />
      </Field>
    </div>
  ),
};

export const TextareaAndSelect: Story = {
  render: () => (
    <div className="flex max-w-lg flex-col gap-6">
      <Field id="t-message" label="Message">
        <Textarea placeholder="How can we help?" />
      </Field>
      <Field id="t-service" label="Service">
        <Select defaultValue="">
          <option value="" disabled>
            Choose a service
          </option>
          <option value="audit">Audit</option>
          <option value="tax">Tax</option>
        </Select>
      </Field>
    </div>
  ),
};

export const DarkEstimatorDisplay: Story = {
  render: () => (
    <div className="max-w-lg bg-bg-inverse p-6">
      <Field id="d-value" label="Estimated annual revenue" theme="dark">
        <TextInput theme="dark" defaultValue="12,000,000" dir="ltr" />
      </Field>
    </div>
  ),
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="flex max-w-lg flex-col gap-6">
      <Field id="a-name" label="اسم الحقل" required help="هذا الحقل مطلوب">
        <TextInput placeholder="نص توضيحي" />
      </Field>
      <Field id="a-err" label="البريد الإلكتروني" error="أدخل بريدًا إلكترونيًا صحيحًا">
        <TextInput defaultValue="abc" dir="ltr" />
      </Field>
      <Field id="a-service" label="الخدمة">
        <Select>
          <option>مراجعة</option>
          <option>ضرائب</option>
        </Select>
      </Field>
    </div>
  ),
};
