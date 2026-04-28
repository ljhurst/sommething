import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from '@/components/Footer';

describe('Footer', () => {
  it('renders attribution text', () => {
    render(<Footer version="1.0.0" />);
    expect(screen.getByText(/Made with/i)).toBeInTheDocument();
    expect(screen.getByText(/by lessthanthree/i)).toBeInTheDocument();
  });

  it('displays version number', () => {
    render(<Footer version="1.3.0" />);
    expect(screen.getByText('v1.3.0')).toBeInTheDocument();
  });

  it('renders GitHub link with correct href', () => {
    render(<Footer version="1.0.0" />);
    const link = screen.getByRole('link', { name: /View source on GitHub/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://github.com/ljhurst/sommething');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
