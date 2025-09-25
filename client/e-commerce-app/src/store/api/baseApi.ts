import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { API_BASE_URL } from '@/constants';

// Dynamic base query that routes to different services
const dynamicBaseQuery = fetchBaseQuery({
  baseUrl: '',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const customBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Route to different services based on endpoint
  if (typeof args === 'string') {
    if (args.startsWith('/orders')) {
      // Route orders to our Order Service
      args = `http://localhost:3001/api${args}`;
    } else {
      // Route products to DummyJSON
      args = `${API_BASE_URL}${args}`;
    }
  } else if (args.url) {
    if (args.url.startsWith('/orders')) {
      args.url = `http://localhost:3001/api${args.url}`;
    } else {
      args.url = `${API_BASE_URL}${args.url}`;
    }
  }

  return dynamicBaseQuery(args, api, extraOptions);
};

// Base API configuration with RTK Query
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: customBaseQuery,
  tagTypes: ['Product', 'Cart', 'Order'],
  endpoints: () => ({}),
});

export default baseApi;