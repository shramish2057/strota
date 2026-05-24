import type { Preview } from '@storybook/react';
import './preview.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'strota-bg',
      values: [
        { name: 'strota-bg', value: '#F8F7F5' },
        { name: 'strota-elevated', value: '#FFFFFF' },
        { name: 'strota-dark', value: '#0E1320' },
      ],
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
