import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormInput } from '@/components/forms/FormInput';

describe('FormInput', () => {
  it('renders label and input', () => {
    render(<FormInput label="Email" />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('generates id from label', () => {
    render(<FormInput label="Email Address" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'email-address');
  });

  it('uses provided id', () => {
    render(<FormInput label="Email" id="custom-id" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it('displays error message', () => {
    render(<FormInput label="Email" error="Invalid email" />);

    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('applies error styling when error present', () => {
    render(<FormInput label="Email" error="Invalid" />);

    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-red-300');
  });

  it('displays hint when no error', () => {
    render(<FormInput label="Email" hint="We'll never share your email" />);

    expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
  });

  it('hides hint when error present', () => {
    render(<FormInput label="Email" hint="Hint text" error="Error text" />);

    expect(screen.queryByText('Hint text')).not.toBeInTheDocument();
    expect(screen.getByText('Error text')).toBeInTheDocument();
  });

  it('forwards input props', () => {
    render(<FormInput label="Email" type="email" placeholder="you@example.com" required />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'you@example.com');
    expect(input).toBeRequired();
  });

  it('handles onChange events', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<FormInput label="Email" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    expect(handleChange).toHaveBeenCalled();
  });

  it('merges custom className', () => {
    render(<FormInput label="Email" className="custom-class" />);

    const input = screen.getByRole('textbox');
    expect(input.className).toContain('custom-class');
    expect(input.className).toContain('px-3');
  });
});
