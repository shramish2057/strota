import type { Meta, StoryObj } from '@storybook/react';
import { Field } from './field.js';
import { Input } from './input.js';

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  parameters: { layout: 'centered' },
  args: { placeholder: 'Musterstrasse 12, 80539 Muenchen' },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const Invalid: Story = { args: { invalid: true, defaultValue: 'kein-gueltiges-format' } };
export const Disabled: Story = { args: { disabled: true } };

export const WithField: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Field
        label="Adresse"
        htmlFor="adresse-demo"
        hint="Strasse und Hausnummer plus Postleitzahl"
        required
      >
        <Input id="adresse-demo" placeholder="Musterstrasse 12, 80539 Muenchen" />
      </Field>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Field
        label="E-Mail"
        htmlFor="email-demo"
        error="Bitte eine gueltige E-Mail-Adresse eingeben."
      >
        <Input id="email-demo" type="email" invalid defaultValue="nicht-valide" />
      </Field>
    </div>
  ),
};
