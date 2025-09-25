// Application constants
export const API_BASE_URL = 'https://dummyjson.com';

export const ROUTES = {
  HOME: '/',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_SUCCESS: '/order-success',
} as const;

export const STORAGE_KEYS = {
  CART: 'ecommerce-cart',
} as const;