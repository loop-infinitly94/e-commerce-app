import React from 'react';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

interface EmptyCartProps {
  onContinueShopping?: () => void;
}

const EmptyCart: React.FC<EmptyCartProps> = ({ onContinueShopping }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Your cart is empty
      </h3>
      
      <p className="text-gray-600 text-center mb-6 max-w-sm">
        Looks like you haven't added any products to your cart yet. 
        Start exploring our amazing collection!
      </p>
      
      {onContinueShopping && (
        <button
          onClick={onContinueShopping}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Continue Shopping
        </button>
      )}
    </div>
  );
};

export default React.memo(EmptyCart);