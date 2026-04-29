import { SelectHTMLAttributes } from 'react';

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: FormSelectOption[];
  error?: string;
}

export function FormSelect({
  label,
  options,
  error,
  id,
  className = '',
  ...props
}: FormSelectProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div>
      <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={selectId}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-wine-red focus:border-transparent text-gray-900 ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${className}`.trim()}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
