import { ReactNode } from 'react';

export type AlertVariant = 'error' | 'success' | 'info' | 'warning';

export interface AlertProps {
  variant: AlertVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<AlertVariant, string> = {
  error: 'bg-red-50 border-red-200 text-red-700',
  success: 'bg-green-50 border-green-200 text-green-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
};

export function Alert({ variant, children, className = '' }: AlertProps) {
  const variantClass = variantClasses[variant];

  return (
    <div className={`p-3 border rounded-lg text-sm ${variantClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
