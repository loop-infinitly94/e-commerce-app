import { baseApi } from './baseApi';
import type { Product, ProductsResponse, ProductsQueryParams } from '@/types/product';

// Simplified Products API endpoints using RTK Query
export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all products - simplified
    getProducts: builder.query<ProductsResponse, ProductsQueryParams | void>({
      query: (params) => {
        const { limit = 30, skip = 0 } = params ?? {};
        return `/products?limit=${limit}&skip=${skip}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
      transformResponse: (response: ProductsResponse) => {
        return {
          ...response,
          products: response.products.map(product => ({
            ...product,
            images: product.images || [product.thumbnail],
            thumbnail: product.thumbnail || product.images?.[0] || '',
          })),
        };
      },
    }),
    
    // Get single product by ID
    getProductById: builder.query<Product, number>({
      query: (id) => `/products/${id}`,
      providesTags: (_, __, id) => [{ type: 'Product', id }],
      transformResponse: (response: Product) => ({
        ...response,
        images: response.images || [response.thumbnail],
        thumbnail: response.thumbnail || response.images?.[0] || '',
      }),
    }),
    
    // Get categories - simplified
    getCategories: builder.query<string[], void>({
      query: () => '/products/categories',
      transformResponse: (response: string[]) => {
        return Array.isArray(response) ? response : [];
      },
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
} = productsApi;

export default productsApi;