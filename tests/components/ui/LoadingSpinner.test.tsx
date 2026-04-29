import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders spinner without message', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with message', () => {
    render(<LoadingSpinner message="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies medium size by default', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner?.className).toContain('h-12');
    expect(spinner?.className).toContain('w-12');
  });

  it('applies small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner?.className).toContain('h-8');
    expect(spinner?.className).toContain('w-8');
  });

  it('applies large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner?.className).toContain('h-16');
    expect(spinner?.className).toContain('w-16');
  });

  it('does not render message when not provided', () => {
    render(<LoadingSpinner />);
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
