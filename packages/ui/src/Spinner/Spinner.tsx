import { HTMLAttributes } from 'react';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

export const Spinner = ({ 
  size = 'md', 
  color = 'border-blue-500',
  className = '',
  ...props 
}: SpinnerProps) => {
  return (
    <div
      className={`
        ${sizeMap[size]}
        border-gray-200 ${color}
        border-t-transparent
        rounded-full
        animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
