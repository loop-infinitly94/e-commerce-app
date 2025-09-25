import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorBoundaryProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  message = 'Something went wrong', 
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
      <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
      <p className="text-red-600 mb-4 text-center">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorBoundary;