import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import PriceRangeFilter from './PriceRangeFilter';
import SortOptions, { type SortOption } from './SortOptions';

interface ProductFiltersProps {
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  
  // Category
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  categoriesLoading?: boolean;
  
  // Price Range
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (price: string) => void;
  onMaxPriceChange: (price: string) => void;
  
  // Sort
  sortValue: string;
  onSortChange: (option: SortOption) => void;
  
  // Clear filters
  onClearFilters: () => void;
  
  // Results info
  totalResults?: number;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  categoriesLoading,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  sortValue,
  onSortChange,
  onClearFilters,
  totalResults,
}) => {
  const hasActiveFilters = searchQuery || selectedCategory || minPrice || maxPrice || sortValue !== 'featured';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      {/* Search and Sort Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search products..."
          />
        </div>
        <div>
          <SortOptions value={sortValue} onChange={onSortChange} />
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
        <div>
          <CategoryFilter
            value={selectedCategory}
            onChange={onCategoryChange}
            categories={categories}
            isLoading={categoriesLoading}
          />
        </div>
        
        <div className="md:col-span-1 lg:col-span-1">
          <PriceRangeFilter
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={onMinPriceChange}
            onMaxPriceChange={onMaxPriceChange}
          />
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              aria-label="Clear all filters"
            >
              <XMarkIcon className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {totalResults !== undefined && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            {totalResults === 0 ? (
              'No products found'
            ) : (
              <>
                Showing <span className="font-semibold">{totalResults}</span> product{totalResults !== 1 ? 's' : ''}
                {hasActiveFilters && (
                  <span className="text-blue-600 ml-1">(filtered)</span>
                )}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductFilters);