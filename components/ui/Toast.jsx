'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Toast({ 
  message, 
  title,
  type = 'success', 
  onClose, 
  duration = 4000,
  position = 'top-right',
  showProgress = true 
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration && showProgress) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 100));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, duration);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [duration, onClose, showProgress]);

  const types = {
    success: {
      bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
      border: 'border-green-200',
      text: 'text-green-800',
      titleText: 'text-green-900',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      progressColor: 'bg-green-500',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-50 to-rose-50',
      border: 'border-red-200',
      text: 'text-red-800',
      titleText: 'text-red-900',
      icon: XCircle,
      iconColor: 'text-red-600',
      progressColor: 'bg-red-500',
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      titleText: 'text-yellow-900',
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
      progressColor: 'bg-yellow-500',
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      titleText: 'text-blue-900',
      icon: Info,
      iconColor: 'text-blue-600',
      progressColor: 'bg-blue-500',
    },
  };

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        'fixed z-50 max-w-sm w-full mx-4 sm:mx-0',
        positions[position],
        isVisible 
          ? 'animate-[slideIn_0.3s_ease-out] opacity-100 translate-x-0' 
          : 'animate-[slideOut_0.3s_ease-in] opacity-0 translate-x-full'
      )}
    >
      <div 
        className={cn(
          'rounded-xl shadow-xl border backdrop-blur-sm overflow-hidden',
          config.bg,
          config.border
        )}
      >
        <div className="p-4 flex items-start gap-3">
          <div className={cn(
            'shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
            config.iconColor === 'text-green-600' && 'bg-green-100',
            config.iconColor === 'text-red-600' && 'bg-red-100',
            config.iconColor === 'text-yellow-600' && 'bg-yellow-100',
            config.iconColor === 'text-blue-600' && 'bg-blue-100'
          )}>
            <Icon className={`w-4 h-4 ${config.iconColor}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={`text-sm font-semibold ${config.titleText} mb-1`}>
                {title}
              </h4>
            )}
            <p className={`text-sm ${config.text} leading-relaxed`}>
              {message}
            </p>
          </div>
          
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className={cn(
              'shrink-0 p-1 rounded-lg transition-all duration-200',
              'hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-1',
              config.text
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {showProgress && duration && (
          <div className="h-1 bg-black/10">
            <div 
              className={cn(
                'h-full transition-all duration-100 ease-linear',
                config.progressColor
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}