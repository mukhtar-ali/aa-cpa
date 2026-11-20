import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Section } from './Section';
import { Container } from '../Container';

const meta: Meta<typeof Section> = {
  title: 'Layout/Section',
  component: Section,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3713',
    },
    docs: {
      description: {
        component:
          'Section component creates full-width thematic bands with tone backgrounds (page/ice/surface/inverse/hero), 30px token radii, and pattern slots.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Section>;

export const DefaultPage: Story = {
  render: () => (
    <Section tone="page" spacing="lg">
      <Container>
        <h2 className="text-h2 font-bold text-text-heading">Page Tone Section</h2>
        <p className="text-body-lg text-text-muted mt-2">
          Standard white page background for primary reading sections.
        </p>
      </Container>
    </Section>
  ),
};

export const Ice: Story = {
  render: () => (
    <Section tone="ice" spacing="lg">
      <Container>
        <h2 className="text-h2 font-bold text-text-heading">Ice Tone Section</h2>
        <p className="text-body-lg text-text-muted mt-2">
          Cool tinted subtle background used for methodology, features, and cards.
        </p>
      </Container>
    </Section>
  ),
};

export const Surface: Story = {
  render: () => (
    <Section tone="surface" spacing="lg">
      <Container>
        <h2 className="text-h2 font-bold text-text-heading">Surface Tone Section</h2>
        <p className="text-body-lg text-text-muted mt-2">
          Elevated surface tone for content blocks and distinct page areas.
        </p>
      </Container>
    </Section>
  ),
};

export const Inverse: Story = {
  render: () => (
    <Section tone="inverse" spacing="lg">
      <Container>
        <h2 className="text-h2 font-bold text-text-inverse">Inverse Tone Section</h2>
        <p className="text-body-lg text-text-muted mt-2">
          Deep navy inverse background for high-contrast statement and proof sections.
        </p>
      </Container>
    </Section>
  ),
};

export const Hero: Story = {
  render: () => (
    <Section tone="hero" spacing="xl">
      <Container>
        <h1 className="text-h1 font-bold text-text-inverse">Hero Tone Section</h1>
        <p className="text-body-lg text-text-muted mt-2">
          Atmospheric hero band for page intros and homepage banner.
        </p>
      </Container>
    </Section>
  ),
};

export const RoundedBoth: Story = {
  render: () => (
    <div className="bg-bg-page p-6">
      <Section tone="ice" rounded="both" spacing="md">
        <Container>
          <h3 className="text-h3 font-bold text-text-heading">Both Ends Rounded (30px)</h3>
          <p className="text-body-md text-text-muted mt-1">
            Section with 30px corner radius on top and bottom edges.
          </p>
        </Container>
      </Section>
    </div>
  ),
};

export const WithPattern: Story = {
  render: () => (
    <Section
      tone="hero"
      spacing="xl"
      pattern={
        <div className="w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--color-action-primary)_1px,_transparent_1px)] bg-[size:24px_24px]" />
      }
    >
      <Container>
        <h2 className="text-h2 font-bold text-text-inverse">Section with Background Pattern</h2>
        <p className="text-body-lg text-text-muted mt-2">
          Demonstrates pattern node slot rendered beneath content in an aria-hidden overlay.
        </p>
      </Container>
    </Section>
  ),
};

export const Arabic: Story = {
  parameters: {
    locale: 'ar',
  },
  render: () => (
    <div dir="rtl">
      <Section tone="ice" spacing="lg">
        <Container>
          <h2 className="text-h2 font-bold text-text-heading">قسم بخلفية بلون الثلج</h2>
          <p className="text-body-lg text-text-muted mt-2">
            يوفر هذا القسم فاصلاً بصرياً متناسقاً مع هوية الموقع المهنية ويدعم التوجه من اليمين إلى اليسار.
          </p>
        </Container>
      </Section>
    </div>
  ),
};

export const English: Story = {
  parameters: {
    locale: 'en',
  },
  render: () => (
    <div dir="ltr">
      <Section tone="ice" spacing="lg">
        <Container>
          <h2 className="text-h2 font-bold text-text-heading">Ice Tone Section in English</h2>
          <p className="text-body-lg text-text-muted mt-2">
            Demonstrates LTR layout alignment within the design system container and section wrapper.
          </p>
        </Container>
      </Section>
    </div>
  ),
};
