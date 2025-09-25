import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
  isLoading?: boolean;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  value,
  onChange,
  categories,
  isLoading = false,
}) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className="appearance-none w-full py-3 pl-4 pr-10 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {categories
          .filter((category) => category && typeof category === 'string')
          .map((category) => {
            const displayName = category.charAt(0).toUpperCase() + category.slice(1).replace(/[-_]/g, ' ');
            return (
              <option key={category} value={category}>
                {displayName}
              </option>
            );
          })}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
    </div>
  );
};

export default React.memo(CategoryFilter);