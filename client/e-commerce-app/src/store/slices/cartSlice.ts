import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants';

export interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  isOpen: boolean;
}

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const storedCart = localStorage.getItem(STORAGE_KEYS.CART);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch {
    return [];
  }
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
  } catch {
    // Handle storage error silently
  }
};

// Calculate totals helper
const calculateTotals = (items: CartItem[]) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { totalQuantity, totalAmount };
};

const initialItems = loadCartFromStorage();
const { totalQuantity, totalAmount } = calculateTotals(initialItems);

const initialState: CartState = {
  items: initialItems,
  totalQuantity,
  totalAmount,
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        // Check stock before increasing quantity
        if (existingItem.quantity < existingItem.stock) {
          existingItem.quantity += 1;
        }
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      
      // Recalculate totals
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      
      // Save to localStorage
      saveCartToStorage(state.items);
    },
    
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      
      // Recalculate totals
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      
      // Save to localStorage
      saveCartToStorage(state.items);
    },
    
    updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item && quantity > 0 && quantity <= item.stock) {
        item.quantity = quantity;
      }
      
      // Recalculate totals
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      
      // Save to localStorage
      saveCartToStorage(state.items);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      
      // Clear localStorage
      saveCartToStorage([]);
    },
    
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  setCartOpen,
} = cartSlice.actions;

export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotalQuantity = (state: { cart: CartState }) => state.cart.totalQuantity;
export const selectCartTotalAmount = (state: { cart: CartState }) => state.cart.totalAmount;
export const selectCartIsOpen = (state: { cart: CartState }) => state.cart.isOpen;
export const selectCartItemById = (id: number) => (state: { cart: CartState }) =>
  state.cart.items.find(item => item.id === id);