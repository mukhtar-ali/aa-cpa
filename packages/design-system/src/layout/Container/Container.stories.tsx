import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Container } from './Container';

const meta: Meta<typeof Container> = {
  title: 'Layout/Container',
  component: Container,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-169',
    },
    docs: {
      description: {
        component:
          'Container aligns content horizontally with 1140px content width token and 16/24/32px responsive gutters per research R12.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Default: Story = {
  render: () => (
    <Container className="bg-bg-surface-ice py-4 text-center border border-border-subtle rounded-md">
      <p className="text-text-heading font-medium">Default 1140px Container</p>
    </Container>
  ),
};

export const Wide: Story = {
  render: () => (
    <Container size="wide" className="bg-bg-surface-ice py-4 text-center border border-border-subtle rounded-md">
      <p className="text-text-heading font-medium">Wide 1320px Container</p>
    </Container>
  ),
};

export const Full: Story = {
  render: () => (
    <Container size="full" className="bg-bg-surface-ice py-4 text-center border border-border-subtle rounded-md">
      <p className="text-text-heading font-medium">Full Width Container</p>
    </Container>
  ),
};

export const Arabic: Story = {
  parameters: {
    locale: 'ar',
  },
  render: () => (
    <div dir="rtl">
      <Container className="bg-bg-surface-ice py-4 text-start border border-border-subtle rounded-md">
        <h2 className="text-h3 font-bold text-text-heading">حاوية المحتوى الأساسية</h2>
        <p className="text-body-md text-text-muted mt-2">
          تضمن الحاوية توافق المحتوى مع شبكة التصميم المعتمدة في فيجما بعرض 1140 بكسل وهوامش متجاوبة.
        </p>
      </Container>
    </div>
  ),
};

export const English: Story = {
  parameters: {
    locale: 'en',
  },
  render: () => (
    <div dir="ltr">
      <Container className="bg-bg-surface-ice py-4 text-start border border-border-subtle rounded-md">
        <h2 className="text-h3 font-bold text-text-heading">Primary Content Container</h2>
        <p className="text-body-md text-text-muted mt-2">
          Enforces the 1140px content width with 16/24/32px responsive gutters aligned with Figma specifications.
        </p>
      </Container>
    </div>
  ),
};
