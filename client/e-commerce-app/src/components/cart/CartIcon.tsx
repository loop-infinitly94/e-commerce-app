import React from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '@/hooks/redux';

interface CartIconProps {
  onClick: () => void;
  className?: string;
}

const CartIcon: React.FC<CartIconProps> = ({ onClick, className = '' }) => {
  const { totalQuantity } = useAppSelector((state) => state.cart);

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-blue-600 transition-colors ${className}`}
      aria-label={`Shopping cart with ${totalQuantity} items`}
    >
      <ShoppingCartIcon className="h-6 w-6" />
      {totalQuantity > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold animate-pulse">
          {totalQuantity > 99 ? '99+' : totalQuantity}
        </span>
      )}
    </button>
  );
};

export default React.memo(CartIcon);