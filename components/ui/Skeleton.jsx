export default function Skeleton({ className = '', variant = 'default' }) {
  const variants = {
    default: 'h-4 bg-gray-200 rounded',
    text: 'h-4 bg-gray-200 rounded w-3/4',
    title: 'h-8 bg-gray-200 rounded w-1/2',
    avatar: 'h-12 w-12 bg-gray-200 rounded-full',
    card: 'h-32 bg-gray-200 rounded-lg',
    button: 'h-10 w-24 bg-gray-200 rounded-lg',
  };

  return (
    <div className={`animate-pulse ${variants[variant]} ${className}`}></div>
  );
}