import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink } from './SkipLink';

const meta: Meta<typeof SkipLink> = { title: 'Sections/SkipLink', component: SkipLink, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof SkipLink>;

/** Press Tab to reveal it. */
export const English: Story = { args: { label: 'Skip to content' } };
export const Arabic: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <SkipLink label="تخطَّ إلى المحتوى" />
    </div>
  ),
};
