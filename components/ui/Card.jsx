import { cn } from '@/lib/utils';

export default function Card({ 
  children, 
  className, 
  variant = 'default',
  hover = false,
  padding = 'default',
  ...props 
}) {
  const baseStyles = 'bg-white rounded-2xl border border-gray-100 transition-all duration-200';
  
  const variants = {
    default: 'shadow-sm hover:shadow-md',
    elevated: 'shadow-lg hover:shadow-xl',
    flat: 'shadow-none border-gray-200',
    gradient: 'bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const hoverEffects = hover ? 'hover:scale-[1.02] hover:shadow-lg cursor-pointer' : '';

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        paddings[padding],
        hoverEffects,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}