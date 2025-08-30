import React from 'react';

const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Analytics and business insights.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-3xl">📊</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reports Module</h2>
        <p className="text-gray-600 mb-6">This module will include:</p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
          <li>• Sales reports & analytics</li>
          <li>• Daily & monthly summaries</li>
          <li>• Profit & loss statements</li>
          <li>• Inventory usage reports</li>
          <li>• PDF export functionality</li>
        </ul>
        <p className="text-sm text-gray-500 mt-6">Coming soon...</p>
      </div>
    </div>
  );
};

export default ReportsPage;
