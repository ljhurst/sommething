import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BottleCircle } from '@/components/BottleCircle';
import { WineType, type Bottle } from '@/lib/types';

describe('BottleCircle', () => {
  const mockBottle: Bottle = {
    id: '1',
    winery: 'Test Winery',
    name: 'Test Wine',
    type: WineType.RED,
    year: 2020,
    price: 25.0,
    slot_position: 5,
    created_at: new Date().toISOString(),
  };

  it('should render bottle with winery name', () => {
    const onClick = vi.fn();
    const { getByText } = render(<BottleCircle bottle={mockBottle} onClick={onClick} />);

    expect(getByText('Test Winery')).toBeInTheDocument();
  });

  it('should render bottle with wine name', () => {
    const onClick = vi.fn();
    const { getByText } = render(<BottleCircle bottle={mockBottle} onClick={onClick} />);

    expect(getByText('Test Wine')).toBeInTheDocument();
  });

  it('should display slot number', () => {
    const onClick = vi.fn();
    const { getByText } = render(<BottleCircle bottle={mockBottle} onClick={onClick} />);

    expect(getByText('5')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    const { getByRole } = render(<BottleCircle bottle={mockBottle} onClick={onClick} />);

    const button = getByRole('button');
    button.click();

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should have correct aria-label', () => {
    const onClick = vi.fn();
    const { getByLabelText } = render(<BottleCircle bottle={mockBottle} onClick={onClick} />);

    const button = getByLabelText('Test Winery Test Wine');
    expect(button).toBeInTheDocument();
  });
});
