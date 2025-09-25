import React from 'react';
import { StarIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import type { Product } from '@/types/product';
import { useAppDispatch } from '@/hooks/redux';
import { addToCart } from '@/store/slices/cartSlice';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.thumbnail,
      stock: product.stock,
    }));
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <StarIconSolid className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-gray-300" />);
      }
    }

    return stars;
  };

  const discountedPrice = product.discountPercentage 
    ? product.price * (1 - product.discountPercentage / 100)
    : product.price;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
      <div className="relative overflow-hidden">
        <img 
          src={product.thumbnail} 
          alt={product.title}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {product.discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            -{Math.round(product.discountPercentage)}%
          </div>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
            Only {product.stock} left
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white font-bold text-lg bg-red-600 px-4 py-2 rounded-lg">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 text-base leading-snug group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {renderStars(product.rating)}
              <span className="text-sm text-gray-500 ml-1 font-medium">
                {product.rating}
              </span>
            </div>
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              <span className="capitalize font-medium">{product.category}</span>
            </div>
          </div>
          
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              {product.discountPercentage > 0 ? (
                <div className="space-y-1">
                  <span className="text-xl font-bold text-green-600">
                    ${discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 transform ${
              product.stock === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
            }`}
            aria-label={`Add ${product.title} to cart`}
          >
            <ShoppingCartIcon className="w-4 h-4" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);