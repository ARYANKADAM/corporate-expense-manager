import { cn } from '@/lib/utils';

export default function Skeleton({ 
  className = '', 
  variant = 'default',
  width,
  height,
  lines = 1,
  animated = true 
}) {
  const variants = {
    default: 'h-4 bg-gray-200 rounded',
    text: 'h-4 bg-gray-200 rounded w-3/4',
    title: 'h-8 bg-gray-200 rounded w-1/2',
    subtitle: 'h-6 bg-gray-200 rounded w-2/3',
    avatar: 'h-12 w-12 bg-gray-200 rounded-full shrink-0',
    'avatar-sm': 'h-8 w-8 bg-gray-200 rounded-full shrink-0',
    'avatar-lg': 'h-16 w-16 bg-gray-200 rounded-full shrink-0',
    card: 'h-32 bg-gray-200 rounded-xl',
    button: 'h-10 w-24 bg-gray-200 rounded-lg',
    'button-sm': 'h-8 w-20 bg-gray-200 rounded-md',
    'button-lg': 'h-12 w-32 bg-gray-200 rounded-lg',
    input: 'h-12 w-full bg-gray-200 rounded-xl',
    badge: 'h-6 w-16 bg-gray-200 rounded-full',
    rectangle: 'bg-gray-200 rounded-lg',
    circle: 'bg-gray-200 rounded-full',
    line: 'h-px bg-gray-200 w-full',
  };

  // Handle multiple text lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 bg-gray-200 rounded',
              i === lines - 1 ? 'w-2/3' : 'w-full', // Last line shorter
              animated && 'animate-pulse'
            )}
          />
        ))}
      </div>
    );
  }

  const baseClasses = cn(
    variants[variant],
    animated && 'animate-pulse',
    'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200',
    animated && 'bg-[length:200%_100%] animate-[shimmer_2s_infinite]',
    className
  );

  const style = {
    ...(width && { width }),
    ...(height && { height }),
  };

  return <div className={baseClasses} style={style} />;
}

// Skeleton composition components
Skeleton.Card = function SkeletonCard({ children, className }) {
  return (
    <div className={cn('p-4 border rounded-xl bg-white', className)}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Skeleton variant="avatar" />
          <div className="space-y-2 flex-1">
            <Skeleton variant="title" />
            <Skeleton variant="text" />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

Skeleton.List = function SkeletonList({ items = 3, className }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton variant="avatar-sm" />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" />
            <Skeleton width="60%" variant="text" />
          </div>
        </div>
      ))}
    </div>
  );
};

Skeleton.Table = function SkeletonTable({ rows = 5, cols = 4, className }) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} variant="subtitle" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }, (_, colIndex) => (
            <Skeleton key={colIndex} variant="text" />
          ))}
        </div>
      ))}
    </div>
  );
};