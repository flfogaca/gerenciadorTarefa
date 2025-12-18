interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`skeleton-card ${className}`}>
      <div className="p-4 space-y-3">
        <div className="skeleton-text w-3/4"></div>
        <div className="skeleton-text w-1/2"></div>
        <div className="flex items-center space-x-2">
          <div className="skeleton-avatar w-6 h-6"></div>
          <div className="skeleton-text w-20"></div>
        </div>
      </div>
    </div>
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 1, className = '' }: SkeletonTextProps) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`skeleton-text ${index < lines - 1 ? 'mb-2' : ''}`}
          style={{ width: `${Math.random() * 40 + 60}%` }}
        ></div>
      ))}
    </div>
  );
}

interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SkeletonAvatar({ size = 'md', className = '' }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`skeleton-avatar ${sizeClasses[size]} ${className}`}></div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'loading-spinner-small',
    md: 'loading-spinner-medium',
    lg: 'loading-spinner-large'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}></div>
  );
}

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Carregando...' }: LoadingOverlayProps) {
  return (
    <div className="loading-overlay">
      <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}
