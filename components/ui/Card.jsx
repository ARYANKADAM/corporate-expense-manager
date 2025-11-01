import { cn } from '@/lib/utils';

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}