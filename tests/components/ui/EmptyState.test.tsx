import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '@/components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders title and message', () => {
    render(<EmptyState title="No Items" message="Get started by adding your first item" />);

    expect(screen.getByText('No Items')).toBeInTheDocument();
    expect(screen.getByText('Get started by adding your first item')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <EmptyState
        title="No Items"
        message="Get started"
        icon={<div data-testid="custom-icon">Icon</div>}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const handleAction = vi.fn();

    render(
      <EmptyState
        title="No Items"
        message="Get started"
        actionLabel="Add Item"
        onAction={handleAction}
      />
    );

    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });

  it('calls onAction when button clicked', async () => {
    const handleAction = vi.fn();
    const user = userEvent.setup();

    render(
      <EmptyState
        title="No Items"
        message="Get started"
        actionLabel="Add Item"
        onAction={handleAction}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Add Item' }));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('does not render button when actionLabel missing', () => {
    render(<EmptyState title="No Items" message="Get started" onAction={() => {}} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render button when onAction missing', () => {
    render(<EmptyState title="No Items" message="Get started" actionLabel="Add Item" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
