import React from 'react';
import { Product } from '../../types';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

interface CartItem {
  product: Product;
  quantity: number;
}

interface POSCartProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  subtotal: number;
  total: number;
  onProceedToPayment: () => void;
}

const POSCart: React.FC<POSCartProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  subtotal,
  total,
  onProceedToPayment,
}) => {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Cart Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Current Order</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{itemCount} items</span>
            {cart.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cart is empty</h3>
            <p className="text-gray-600">Add items from the menu to get started</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.product.id}
              className="bg-white rounded-lg border border-gray-200 p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm leading-tight">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    ₹{item.product.price.toFixed(2)} each
                  </p>
                </div>
                
                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="ml-2 text-red-500 hover:text-red-700 p-1"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    className="w-8 h-8 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  
                  <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="border-t bg-gray-50 p-4 space-y-3">
          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (5%):</span>
              <span className="font-medium">₹{(subtotal * 0.05).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium text-green-600">-₹0.00</span>
            </div>
            
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>₹{(subtotal * 1.05).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={onProceedToPayment}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Proceed to Payment
          </button>
        </div>
      )}
    </div>
  );
};

export default POSCart;
