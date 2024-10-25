import React from 'react';
import { createRoot } from 'react-dom/client';
import { Display } from './index';

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(<Display />);
} else {
  // eslint-disable-next-line no-console
  console.error('Failed to find the app container');
}
