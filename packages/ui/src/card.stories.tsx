import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge.js';
import { Button } from './button.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card.js';

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Card>
        <CardHeader>
          <Badge tone="primary">Vereinfachtes Verfahren</Badge>
          <CardTitle>Neubau EFH Musterstrasse 12</CardTitle>
          <CardDescription>
            Bayern, GK2, vereinfachtes Genehmigungsverfahren. 12 Pflichtdokumente.
          </CardDescription>
        </CardHeader>
        <CardContent>Aktenzeichen: noch nicht erteilt. Status: in Vorbereitung.</CardContent>
        <CardFooter>
          <Button variant="secondary">Oeffnen</Button>
          <Button>Vollstaendigkeit pruefen</Button>
        </CardFooter>
      </Card>
    </div>
  ),
};
