import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WineFormFields, WineFormData } from '@/components/forms/WineFormFields';
import { WineType } from '@/lib/types';

describe('WineFormFields', () => {
  const defaultFormData: WineFormData = {
    winery: '',
    name: '',
    type: WineType.RED,
    year: 2024,
    price: '',
    score: '',
    notes: '',
  };

  it('renders all wine form fields', () => {
    const handleChange = vi.fn();
    render(<WineFormFields value={defaultFormData} onChange={handleChange} />);

    expect(screen.getByLabelText(/winery/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wine name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/score/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tasting notes/i)).toBeInTheDocument();
  });

  it('displays current values', () => {
    const formData: WineFormData = {
      winery: 'Test Winery',
      name: 'Test Wine',
      type: WineType.RED,
      year: 2020,
      price: '50',
      score: '95',
      notes: 'Great wine',
    };
    const handleChange = vi.fn();

    render(<WineFormFields value={formData} onChange={handleChange} />);

    expect(screen.getByDisplayValue('Test Winery')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Wine')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2020')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    expect(screen.getByDisplayValue('95')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Great wine')).toBeInTheDocument();
  });

  it('calls onChange when winery changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<WineFormFields value={defaultFormData} onChange={handleChange} />);

    const wineryInput = screen.getByLabelText(/winery/i);
    await user.type(wineryInput, 'New Winery');

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].winery).toContain('N');
  });

  it('calls onChange when wine type button clicked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<WineFormFields value={defaultFormData} onChange={handleChange} />);

    const whiteButton = screen.getByRole('button', { name: /white/i });
    await user.click(whiteButton);

    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ type: WineType.WHITE }));
  });

  it('highlights selected wine type', () => {
    const handleChange = vi.fn();
    const formData = { ...defaultFormData, type: WineType.SPARKLING };

    render(<WineFormFields value={formData} onChange={handleChange} />);

    const sparklingButton = screen.getByRole('button', { name: /sparkling/i });
    expect(sparklingButton.className).toContain('bg-wine-red');
  });

  it('hides notes when showNotes is false', () => {
    const handleChange = vi.fn();

    render(<WineFormFields value={defaultFormData} onChange={handleChange} showNotes={false} />);

    expect(screen.queryByLabelText(/tasting notes/i)).not.toBeInTheDocument();
  });

  it('disables all fields when disabled prop is true', () => {
    const handleChange = vi.fn();

    render(<WineFormFields value={defaultFormData} onChange={handleChange} disabled />);

    expect(screen.getByLabelText(/winery/i)).toBeDisabled();
    expect(screen.getByLabelText(/wine name/i)).toBeDisabled();
    expect(screen.getByLabelText(/year/i)).toBeDisabled();
  });

  it('displays error messages', () => {
    const handleChange = vi.fn();
    const errors = {
      winery: 'Winery is required',
      name: 'Name is required',
    };

    render(<WineFormFields value={defaultFormData} onChange={handleChange} errors={errors} />);

    expect(screen.getByText('Winery is required')).toBeInTheDocument();
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('renders all wine type buttons', () => {
    const handleChange = vi.fn();

    render(<WineFormFields value={defaultFormData} onChange={handleChange} />);

    expect(screen.getByRole('button', { name: /^red$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^white$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^rose$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sparkling$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^dessert$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^other$/i })).toBeInTheDocument();
  });
});
