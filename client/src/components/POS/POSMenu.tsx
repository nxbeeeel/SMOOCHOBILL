import React from 'react';
import { Product } from '../../types';
import { menuService } from '../../services/menuService';

interface POSMenuProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const POSMenu: React.FC<POSMenuProps> = ({ products, onAddToCart }) => {
  const getProductImage = (product: Product) => {
    return menuService.getProductImage(product.id) || '/images/default-product.svg';
  };

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🍦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try selecting a different category</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer touch-manipulation"
          onClick={() => onAddToCart(product)}
        >
          {/* Product Image */}
          <div className="aspect-square bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center relative overflow-hidden">
            <img
              src={getProductImage(product)}
              alt={product.name}
              className="w-full h-full object-cover"
                             onError={(e) => {
                 const target = e.target as HTMLImageElement;
                 target.src = '/images/default-product.svg';
               }}
            />
            {/* Price Badge */}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
              <span className="text-sm font-bold text-gray-900">
                ₹{product.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-3">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                {product.description}
              </p>
            )}
            
            {/* Category Badge */}
            {product.category_name && (
              <div className="flex items-center justify-between">
                <span 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${product.category_color}20`,
                    color: product.category_color,
                  }}
                >
                  {product.category_name}
                </span>
                
                {/* Add Button */}
                <button
                  className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-blue-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default POSMenu;
