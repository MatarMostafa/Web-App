/**
 * Loading Card Component
 * Skeleton loading component for card layouts
 */

import React from 'react';
import { cn } from '@/utils/helpers';

export interface LoadingCardProps {
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  className,
  showAvatar = true,
  lines = 3,
}) => {
  return (
    <div className={cn('animate-pulse bg-white p-6 rounded-lg shadow', className)}>
      <div className="flex items-center space-x-4 mb-4">
        {showAvatar && (
          <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
        )}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-3 bg-gray-300 rounded',
              index === lines - 1 ? 'w-2/3' : 'w-full'
            )}
          ></div>
        ))}
      </div>
    </div>
  );
}; 