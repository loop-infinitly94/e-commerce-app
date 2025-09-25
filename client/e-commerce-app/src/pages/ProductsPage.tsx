import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/store/api/productsApi';
import { useCreateOrderMutation } from '@/store/api/ordersApi';
import type { RootState } from '@/store';
import ProductList from '@/components/product/ProductList';
import ProductFilters from '@/components/product/ProductFilters';
import { CartIcon, CartDrawer } from '@/components/cart';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import type { SortOption } from '@/components/product/SortOptions';

const ProductsPage: React.FC = () => {
  // Cart and Order hooks
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 20;
  const skip = currentPage * limit;

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>({
    label: 'Featured',
    value: 'featured',
    sortBy: '',
    order: 'asc',
  });

  // Cart drawer state
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Build query params with filters
  const queryParams = {
    limit,
    skip,
    search: searchQuery || undefined,
    category: selectedCategory || undefined,
    sortBy: sortOption.sortBy ? (sortOption.sortBy as 'title' | 'price' | 'rating') : undefined,
    order: sortOption.sortBy ? sortOption.order : undefined,
  };

  // API queries
  const {
    data,
    error,
    isLoading,
    refetch,
  } = useGetProductsQuery(queryParams);

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useGetCategoriesQuery();

  // Filter products by price range on client side (since API doesn't support price filtering)
  const filteredProducts = data?.products?.filter(product => {
    const price = product.price;
    const minPriceNum = parseFloat(minPrice) || 0;
    const maxPriceNum = parseFloat(maxPrice) || Infinity;
    return price >= minPriceNum && price <= maxPriceNum;
  }) || [];

  const totalPages = data ? Math.ceil(data.total / limit) : 0;
  const totalFilteredResults = filteredProducts.length;

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handlePageSelect = (page: number) => {
    setCurrentPage(page);
  };

  // Filter handlers
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(0); // Reset to first page when filtering
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentPage(0);
  }, []);

  const handleSortChange = useCallback((option: SortOption) => {
    setSortOption(option);
    setCurrentPage(0);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortOption({
      label: 'Featured',
      value: 'featured',
      sortBy: '',
      order: 'asc',
    });
    setCurrentPage(0);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <ErrorBoundary
            message="Failed to load products. Please try again."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Discover Amazing Products
              </h1>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Explore our carefully curated collection of products designed to enhance your lifestyle
              </p>
            </div>
            
            {/* Cart Icon */}
            <div className="ml-4">
              <CartIcon 
                onClick={() => setIsCartOpen(true)} 
                className="bg-white rounded-full shadow-lg hover:shadow-xl p-2"
              />
            </div>
          </div>
          {data && (
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm px-6 py-4 mb-6">
              <p className="text-gray-700 font-medium">
                Showing <span className="font-bold text-blue-600">{totalFilteredResults}</span> of <span className="font-bold">{data.total}</span> products
                {(searchQuery || selectedCategory || minPrice || maxPrice || sortOption.value !== 'featured') && (
                  <span className="text-blue-600 ml-1">(filtered)</span>
                )}
              </p>
              <div className="text-sm text-gray-500">
                Page {currentPage + 1} of {totalPages}
              </div>
            </div>
          )}
        </div>

        {/* Product Filters */}
        <ProductFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          categoriesLoading={categoriesLoading}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          sortValue={sortOption.value}
          onSortChange={handleSortChange}
          onClearFilters={handleClearFilters}
          totalResults={filteredProducts.length}
        />

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }, (_, index) => `skeleton-${index}`).map((id) => (
              <div key={id} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="w-full h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-300 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
                  <div className="h-12 bg-gray-300 rounded-lg w-full mt-3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredProducts.length > 0 && (
          <ProductList 
            products={filteredProducts} 
            isLoading={false}
          />
        )}

        {!isLoading && filteredProducts.length === 0 && data && (
          <div className="text-center py-12">
            <div className="text-gray-600 text-lg mb-2">
              No products found
            </div>
            <div className="text-sm text-gray-500">
              Debug: {JSON.stringify({ hasData: !!data, productsCount: data?.products?.length, total: data?.total })}
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {data && totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-4 flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentPage === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1 mx-4">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage <= 2) {
                    pageNum = i;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageSelect(pageNum)}
                      className={`w-12 h-12 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentPage === totalPages - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onCheckout={async () => {
            if (cartItems.length === 0) {
              alert('Your cart is empty!');
              return;
            }

            if (isCreatingOrder) {
              return; // Prevent double clicks
            }

            try {
              const orderData = {
                userId: `user-${Date.now()}`, // Simple user ID for demo
                items: cartItems.map(item => ({
                  id: item.id,
                  title: item.title,
                  quantity: item.quantity,
                  price: item.price,
                  thumbnail: item.image
                })),
                customerEmail: 'customer@example.com', // Demo email
                customerName: 'Demo Customer' // Demo name
              };

              console.log('📤 Creating order with data:', orderData);
              
              const result = await createOrder(orderData).unwrap();
              
              console.log('✅ Order created successfully:', result);
              
              alert(`Order created successfully! Order ID: ${result.data.orderId}`);
              setIsCartOpen(false);
              
            } catch (error) {
              console.error('❌ Order creation failed:', error);
              alert('Failed to create order. Please try again.');
            }
          }}
        />
      </div>
    </div>
  );
};

export default ProductsPage;