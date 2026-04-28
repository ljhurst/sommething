import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { EmptySlot } from '@/components/bottle/EmptySlot';

describe('EmptySlot', () => {
  it('should render with slot number', () => {
    const onClick = vi.fn();
    const { getByText } = render(<EmptySlot slotNumber={10} onClick={onClick} />);

    expect(getByText('10')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    const { getByRole } = render(<EmptySlot slotNumber={10} onClick={onClick} />);

    const button = getByRole('button');
    button.click();

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should have correct aria-label', () => {
    const onClick = vi.fn();
    const { getByLabelText } = render(<EmptySlot slotNumber={15} onClick={onClick} />);

    const button = getByLabelText('Add bottle to slot 15');
    expect(button).toBeInTheDocument();
  });
});
