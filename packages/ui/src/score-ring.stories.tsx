import type { Meta, StoryObj } from '@storybook/react';
import { ScoreRing } from './score-ring.js';

const meta: Meta<typeof ScoreRing> = {
  title: 'Primitives/ScoreRing',
  component: ScoreRing,
  parameters: { layout: 'centered' },
  argTypes: {
    score: { control: { type: 'number', min: 0, max: 100 } },
    size: { control: { type: 'number', min: 48, max: 192 } },
  },
};
export default meta;
type Story = StoryObj<typeof ScoreRing>;

export const Green: Story = { args: { score: 95 } };
export const Amber: Story = { args: { score: 82 } };
export const Orange: Story = { args: { score: 60 } };
export const Red: Story = { args: { score: 32 } };

export const AllThresholds: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <ScoreRing score={95} />
      <ScoreRing score={82} />
      <ScoreRing score={60} />
      <ScoreRing score={32} />
    </div>
  ),
};
