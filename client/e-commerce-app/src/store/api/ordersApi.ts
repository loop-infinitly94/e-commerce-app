import { baseApi } from './baseApi';

export interface OrderItem {
  id: number;
  title: string;
  quantity: number;
  price: number;
  thumbnail?: string;
}

export interface CreateOrderRequest {
  userId: string;
  items: OrderItem[];
  customerEmail: string;
  customerName: string;
}

export interface Order {
  orderId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

// Orders API endpoints using RTK Query
export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new order
    createOrder: builder.mutation<OrderResponse, CreateOrderRequest>({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (response: OrderResponse) => {
        console.log('✅ Order created:', response);
        return response;
      },

    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useCreateOrderMutation,
} = ordersApi;

export default ordersApi;