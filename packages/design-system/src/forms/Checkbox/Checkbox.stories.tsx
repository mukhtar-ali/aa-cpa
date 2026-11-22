import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=522-1194' } },
  args: { label: 'I agree to the terms' },
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox defaultChecked label={<>I accept the <a className="text-text-link underline" href="/terms">terms</a></>} />
      <Checkbox label="Error" error="You must accept the terms" />
      <Checkbox label="Disabled" disabled />
    </div>
  ),
};

export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="flex flex-col gap-4">
      <Checkbox label="أوافق على الشروط" />
      <Checkbox label="أوافق على الشروط" defaultChecked />
    </div>
  ),
};
