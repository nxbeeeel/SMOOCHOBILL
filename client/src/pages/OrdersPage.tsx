import React from 'react';

const OrdersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">Manage and track all orders.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-3xl">📋</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Orders Module</h2>
        <p className="text-gray-600 mb-6">This module will include:</p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
          <li>• Order history & tracking</li>
          <li>• Order status management</li>
          <li>• Order editing & cancellation</li>
          <li>• Customer information</li>
          <li>• Order analytics</li>
        </ul>
        <p className="text-sm text-gray-500 mt-6">Coming soon...</p>
      </div>
    </div>
  );
};

export default OrdersPage;
