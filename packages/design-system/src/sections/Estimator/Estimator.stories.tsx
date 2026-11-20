import type { Meta, StoryObj } from '@storybook/react-vite';
import { Estimator } from './Estimator';

const meta: Meta<typeof Estimator> = {
  title: 'Sections/Estimator',
  component: Estimator,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=411-3855' } },
};
export default meta;
type Story = StoryObj<typeof Estimator>;

export const English: Story = {
  render: () => (
    <div className="max-w-xl">
      <Estimator
        title="Not ready to talk yet? Get a number in 60 seconds"
        intro="Answer four questions for an indicative estimate."
        locale="en"
        config={{
          questions: [
            { id: 'revenue', prompt: 'Approximate annual revenue (SAR)', kind: 'currency', min: 1, placeholder: '12,000,000' },
            { id: 'staff', prompt: 'Number of employees', kind: 'number', min: 1, max: 10000 },
            { id: 'sector', prompt: 'Sector', kind: 'choice', options: [{ value: 'retail', label: 'Retail' }, { value: 'industry', label: 'Industry' }] },
          ],
          labels: { progress: 'Question {n} of {total}', next: 'Next', back: 'Back', start: 'Start estimate', result: 'Your estimated range', disclaimer: 'The result is an estimate only and not a commitment.', restart: 'Start over', invalid: 'Enter a valid answer', error: 'Something went wrong' },
          currency: 'SAR',
          estimate: async () => ({ min: 90000, max: 140000 }),
        }}
      />
    </div>
  ),
};
