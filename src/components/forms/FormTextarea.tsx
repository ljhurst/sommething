import { TextareaHTMLAttributes } from 'react';

export interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function FormTextarea({ label, error, id, className = '', ...props }: FormTextareaProps) {
  const textareaId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div>
      <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        id={textareaId}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-wine-red focus:border-transparent resize-none text-gray-900 ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${className}`.trim()}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
