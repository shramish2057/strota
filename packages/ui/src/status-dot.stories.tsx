import type { Meta, StoryObj } from '@storybook/react';
import { StatusDot } from './status-dot.js';

const meta: Meta<typeof StatusDot> = {
  title: 'Primitives/StatusDot',
  component: StatusDot,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof StatusDot>;

export const Vollstaendig: Story = { args: { tone: 'success', label: 'Vollstaendig' } };
export const Ausstehend: Story = { args: { tone: 'warning', label: 'Ausstehend' } };
export const Fehlt: Story = { args: { tone: 'error', label: 'Fehlt' } };
export const NichtErforderlich: Story = {
  args: { tone: 'neutral', label: 'Nicht erforderlich' },
};
export const Wartet: Story = { args: { tone: 'pending', label: 'Wird validiert' } };

export const AllToneStack: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <StatusDot tone="success" label="Vollstaendig" />
      <StatusDot tone="warning" label="Ausstehend" />
      <StatusDot tone="error" label="Fehlt" />
      <StatusDot tone="neutral" label="Nicht erforderlich" />
      <StatusDot tone="pending" label="Wird validiert" />
    </div>
  ),
};
