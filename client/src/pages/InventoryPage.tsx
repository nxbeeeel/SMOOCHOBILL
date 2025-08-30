import React from 'react';

const InventoryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
        <p className="text-gray-600">Manage stock levels and track ingredients.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-3xl">📦</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory Module</h2>
        <p className="text-gray-600 mb-6">This module will include:</p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
          <li>• Stock level tracking</li>
          <li>• Automatic inventory deduction</li>
          <li>• Low stock alerts</li>
          <li>• Reorder management</li>
          <li>• Recipe-based calculations</li>
        </ul>
        <p className="text-sm text-gray-500 mt-6">Coming soon...</p>
      </div>
    </div>
  );
};

export default InventoryPage;
