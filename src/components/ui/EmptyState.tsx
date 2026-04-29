import { ReactNode } from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md">
        {icon && <div className="flex justify-center mb-6">{icon}</div>}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="px-6 py-3 text-lg">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
