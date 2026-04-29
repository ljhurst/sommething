import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from '@/components/ui/Alert';

describe('Alert', () => {
  it('renders children', () => {
    render(<Alert variant="error">Error message</Alert>);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('applies error variant styling', () => {
    const { container } = render(<Alert variant="error">Error</Alert>);
    const alert = container.firstChild as HTMLElement;
    expect(alert.className).toContain('bg-red-50');
    expect(alert.className).toContain('border-red-200');
    expect(alert.className).toContain('text-red-700');
  });

  it('applies success variant styling', () => {
    const { container } = render(<Alert variant="success">Success</Alert>);
    const alert = container.firstChild as HTMLElement;
    expect(alert.className).toContain('bg-green-50');
    expect(alert.className).toContain('border-green-200');
    expect(alert.className).toContain('text-green-700');
  });

  it('applies info variant styling', () => {
    const { container } = render(<Alert variant="info">Info</Alert>);
    const alert = container.firstChild as HTMLElement;
    expect(alert.className).toContain('bg-blue-50');
    expect(alert.className).toContain('border-blue-200');
    expect(alert.className).toContain('text-blue-700');
  });

  it('applies warning variant styling', () => {
    const { container } = render(<Alert variant="warning">Warning</Alert>);
    const alert = container.firstChild as HTMLElement;
    expect(alert.className).toContain('bg-yellow-50');
    expect(alert.className).toContain('border-yellow-200');
    expect(alert.className).toContain('text-yellow-700');
  });

  it('merges custom className', () => {
    const { container } = render(
      <Alert variant="error" className="custom-class">
        Message
      </Alert>
    );
    const alert = container.firstChild as HTMLElement;
    expect(alert.className).toContain('custom-class');
    expect(alert.className).toContain('bg-red-50');
  });

  it('renders complex children', () => {
    render(
      <Alert variant="error">
        <strong>Error:</strong> Something went wrong
      </Alert>
    );
    expect(screen.getByText('Error:')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
