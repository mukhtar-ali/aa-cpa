import type { Meta, StoryObj } from '@storybook/react-vite';
import { VisuallyHidden } from './VisuallyHidden';

const meta: Meta<typeof VisuallyHidden> = {
  title: 'Primitives/VisuallyHidden',
  component: VisuallyHidden,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-169' } },
};
export default meta;
type Story = StoryObj<typeof VisuallyHidden>;

export const Default: Story = {
  render: () => (
    <p className="text-body-md text-text-body">
      Visible text <VisuallyHidden>(hidden label read by screen readers)</VisuallyHidden>
    </p>
  ),
};
