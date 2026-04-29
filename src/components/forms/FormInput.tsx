import { InputHTMLAttributes } from 'react';

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function FormInput({ label, error, hint, id, className = '', ...props }: FormInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-wine-red focus:border-transparent text-gray-900 ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${className}`.trim()}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
