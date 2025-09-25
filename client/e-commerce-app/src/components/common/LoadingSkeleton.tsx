import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse hover:shadow-xl transition-shadow duration-300">
      <div className="w-full h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-300 rounded-lg w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-1">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-300 rounded-lg w-20"></div>
        </div>
        <div className="h-12 bg-gray-300 rounded-lg w-full mt-3"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;