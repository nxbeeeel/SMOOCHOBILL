import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menuService } from '../services/menuService';
import { Product, Category } from '../types';
import POSMenu from '../components/POS/POSMenu';
import POSCart from '../components/POS/POSCart';
import POSPayment from '../components/POS/POSPayment';
import LoadingSpinner from '../components/LoadingSpinner';

const POSPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [showPayment, setShowPayment] = useState(false);

  // Fetch categories and products
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: menuService.getCategories,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: menuService.getAllProducts,
  });

  // Filter products by selected category
  const filteredProducts = products?.filter(product => 
    selectedCategory === 'all' || product.category_id === selectedCategory
  ) || [];

  // Add item to cart
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  // Update item quantity in cart
  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setShowPayment(false);
  };

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const total = subtotal; // Add tax and discount logic here

  if (categoriesLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Smoocho POS</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Menu */}
        <div className="flex-1 flex flex-col">
          {/* Category Tabs */}
          <div className="bg-white border-b px-6 py-3">
            <div className="flex space-x-1 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Items
              </button>
              {categories?.map((category: Category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    borderColor: category.color,
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <POSMenu
              products={filteredProducts}
              onAddToCart={addToCart}
            />
          </div>
        </div>

        {/* Right Panel - Cart & Payment */}
        <div className="w-96 bg-white border-l flex flex-col">
          <POSCart
            cart={cart}
            onUpdateQuantity={updateCartItemQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            subtotal={subtotal}
            total={total}
            onProceedToPayment={() => setShowPayment(true)}
          />
          
          {showPayment && (
            <POSPayment
              cart={cart}
              total={total}
              onCompletePayment={clearCart}
              onCancel={() => setShowPayment(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default POSPage;
