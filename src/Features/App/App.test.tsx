import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders contact info', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/Anton Ganhammar/i);
  expect(linkElement).toBeInTheDocument();
});
