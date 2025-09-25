import React from 'react';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAppDispatch } from '@/hooks/redux';
import { removeFromCart, updateQuantity } from '@/store/slices/cartSlice';
import type { CartItem as CartItemType } from '@/store/slices/cartSlice';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();

  const handleIncrement = () => {
    if (item.quantity < item.stock) {
      dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }));
    }
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }));
    }
  };

  const handleRemove = () => {
    dispatch(removeFromCart(item.id));
  };

  const subtotal = item.price * item.quantity;

  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-200 last:border-b-0">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <img
          src={item.image}
          alt={item.title}
          className="w-18 h-18 object-cover rounded-lg"
          loading="lazy"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0 pr-2">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
          {item.title}
        </h3>
        <p className="text-sm text-gray-600">
          ${item.price.toFixed(2)} each
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {item.stock} in stock
        </p>
        
        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-gray-500 mr-1">Qty:</span>
          <button
            onClick={handleDecrement}
            disabled={item.quantity <= 1}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease quantity"
          >
            <MinusIcon className="h-4 w-4" />
          </button>

          <span className="w-8 text-center text-sm font-medium text-gray-900">
            {item.quantity}
          </span>

          <button
            onClick={handleIncrement}
            disabled={item.quantity >= item.stock}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase quantity"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Price and Remove Button */}
      <div className="flex flex-col items-end justify-between h-18 flex-shrink-0">
        <p className="text-sm font-semibold text-gray-900">
          ${subtotal.toFixed(2)}
        </p>
        <button
          onClick={handleRemove}
          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          aria-label="Remove item from cart"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default React.memo(CartItem);