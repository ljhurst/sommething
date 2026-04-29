export interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

export function LoadingSpinner({ message, size = 'md' }: LoadingSpinnerProps) {
  const sizeClass = sizeClasses[size];

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-wine-red mx-auto mb-4 ${sizeClass}`}
        />
        {message && <p className="text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
