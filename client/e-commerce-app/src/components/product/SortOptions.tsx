import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export type SortOption = {
  label: string;
  value: string;
  sortBy: string;
  order: 'asc' | 'desc';
};

interface SortOptionsProps {
  value: string;
  onChange: (option: SortOption) => void;
}

const sortOptions: SortOption[] = [
  { label: 'Featured', value: 'featured', sortBy: '', order: 'asc' },
  { label: 'Price: Low to High', value: 'price-asc', sortBy: 'price', order: 'asc' },
  { label: 'Price: High to Low', value: 'price-desc', sortBy: 'price', order: 'desc' },
  { label: 'Rating: High to Low', value: 'rating-desc', sortBy: 'rating', order: 'desc' },
  { label: 'Name: A to Z', value: 'title-asc', sortBy: 'title', order: 'asc' },
  { label: 'Name: Z to A', value: 'title-desc', sortBy: 'title', order: 'desc' },
];

const SortOptions: React.FC<SortOptionsProps> = ({ value, onChange }) => {
  const handleChange = (optionValue: string) => {
    const option = sortOptions.find(opt => opt.value === optionValue);
    if (option) {
      onChange(option);
    }
  };

  return (
    <div className="relative">
      <label htmlFor="sort-options" className="sr-only">
        Sort products by
      </label>
      <select
        id="sort-options"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none w-full py-3 pl-4 pr-10 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        aria-label="Sort products"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
    </div>
  );
};

export default React.memo(SortOptions);