import React from 'react';
import { useAppSelector } from '@/hooks/redux';

interface CartSummaryProps {
  showTitle?: boolean;
  className?: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({ 
  showTitle = true, 
  className = '' 
}) => {
  const { totalQuantity, totalAmount } = useAppSelector((state) => state.cart);

  const estimatedTax = totalAmount * 0.08; // 8% tax
  const shipping = totalAmount > 50 ? 0 : 5.99; // Free shipping over $50
  const finalTotal = totalAmount + estimatedTax + shipping;

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Order Summary
        </h3>
      )}

      <div className="space-y-3">
        {/* Items Count */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Items ({totalQuantity})
          </span>
          <span className="font-medium text-gray-900">
            ${totalAmount.toFixed(2)}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-gray-900">
            {shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Estimated Tax</span>
          <span className="font-medium text-gray-900">
            ${estimatedTax.toFixed(2)}
          </span>
        </div>

        {/* Free shipping threshold */}
        {totalAmount > 0 && totalAmount < 50 && (
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
            Add ${(50 - totalAmount).toFixed(2)} more for free shipping!
          </div>
        )}

        {/* Divider */}
        <hr className="border-gray-200" />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold text-gray-900">
          <span>Total</span>
          <span>${finalTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CartSummary);