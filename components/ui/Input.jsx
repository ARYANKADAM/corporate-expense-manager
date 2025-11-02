import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({ 
  label, 
  error, 
  success,
  helperText,
  icon: Icon,
  className,
  type,
  required,
  ...props 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        
        <input
          type={inputType}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none',
            'focus:ring-4 focus:ring-blue-100 focus:border-blue-500',
            Icon && 'pl-11',
            isPassword && 'pr-11',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-100',
            success && 'border-green-300 focus:border-green-500 focus:ring-green-100',
            !error && !success && 'border-gray-200 hover:border-gray-300',
            isFocused && 'shadow-lg',
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-600 rounded-full"></span>
          {error}
        </p>
      )}
      
      {success && (
        <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
          <span className="w-1 h-1 bg-green-600 rounded-full"></span>
          {success}
        </p>
      )}
      
      {helperText && !error && !success && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}