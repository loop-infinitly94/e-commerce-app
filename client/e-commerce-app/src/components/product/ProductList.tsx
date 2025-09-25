import React from 'react';
import type { Product } from '@/types/product';
import ProductCard from './ProductCard';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';

interface ProductListProps {
  products: Product[];
  isLoading?: boolean;
  error?: string | null;
}

const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  isLoading = false, 
  error = null 
}) => {
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-medium mb-2">
          Failed to load products
        </div>
        <div className="text-gray-600">
          {error}
        </div>
      </div>
    );
  }

  if (isLoading) {
    const skeletonIds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {skeletonIds.map((id) => (
          <LoadingSkeleton key={`skeleton-${id}`} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 text-lg mb-2">
          No products found
        </div>
        <div className="text-gray-500">
          Try adjusting your search or filters
        </div>
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      aria-label="Products list"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default React.memo(ProductList);