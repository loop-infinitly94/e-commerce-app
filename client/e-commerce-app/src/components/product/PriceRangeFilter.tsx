import React from 'react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface PriceRangeFilterProps {
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
        <AdjustmentsHorizontalIcon className="h-4 w-4 text-blue-600" />
        <span>Price Range</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label htmlFor="min-price" className="sr-only">
            Minimum price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              $
            </span>
            <input
              id="min-price"
              type="number"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full py-3 pl-8 pr-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
            />
          </div>
        </div>
        <span className="text-gray-400 font-medium text-sm px-1">to</span>
        <div className="flex-1">
          <label htmlFor="max-price" className="sr-only">
            Maximum price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              $
            </span>
            <input
              id="max-price"
              type="number"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              placeholder="∞"
              min="0"
              step="0.01"
              className="w-full py-3 pl-8 pr-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PriceRangeFilter);