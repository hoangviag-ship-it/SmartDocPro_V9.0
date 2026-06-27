import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import React from 'react';

describe('App Component', () => {
  it('renders MainLayout with SmartDoc logo text', () => {
    render(<App />);
    expect(screen.getByText(/SmartDoc/i)).toBeInTheDocument();
  });
});
