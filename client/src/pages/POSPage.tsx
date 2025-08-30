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
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch categories and products (no authentication required)
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['pos-categories'],
    queryFn: menuService.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['pos-products'],
    queryFn: menuService.getAllProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter products by selected category and search query
  const filteredProducts = products?.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category_id === selectedCategory;
    const searchMatch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  }) || [];

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
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

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
            <div className="text-sm text-gray-600">
              {new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Menu */}
        <div className="flex-1 flex flex-col">
          {/* Search and Category Filter */}
          <div className="bg-white p-4 border-b">
            <div className="flex space-x-4">
              {/* Search Bar */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories?.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <POSMenu 
              products={filteredProducts}
              onAddToCart={addToCart}
              getProductImage={menuService.getProductImage}
            />
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="w-96 bg-white border-l">
          <POSCart
            cart={cart}
            onUpdateQuantity={updateCartItemQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            subtotal={subtotal}
            tax={tax}
            total={total}
            onProceedToPayment={() => setShowPayment(true)}
          />
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <POSPayment
          cart={cart}
          total={total}
          onClose={() => setShowPayment(false)}
          onPaymentComplete={() => {
            clearCart();
            setShowPayment(false);
          }}
        />
      )}
    </div>
  );
};

export default POSPage;
