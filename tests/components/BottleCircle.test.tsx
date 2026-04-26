import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BottleCircle } from '@/components/BottleCircle';
import { WineType, type BottleInstance, type Wine } from '@/lib/types';

describe('BottleCircle', () => {
  const mockWine: Wine = {
    id: 'wine-1',
    created_by_user_id: 'user-1',
    winery: 'Test Winery',
    name: 'Test Wine',
    type: WineType.RED,
    year: 2020,
    price: 25.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockBottle: BottleInstance = {
    id: '1',
    wine_id: 'wine-1',
    space_id: 'space-1',
    slot_position: 5,
    added_at: new Date().toISOString(),
    wine: mockWine,
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
