import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Printer Configuration</h3>
            <p className="text-sm text-gray-600">Configure thermal printer settings</p>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Payment Integration</h3>
            <p className="text-sm text-gray-600">Setup Paytm and other payment methods</p>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Delivery Platforms</h3>
            <p className="text-sm text-gray-600">Configure Zomato and Swiggy integration</p>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Notifications</h3>
            <p className="text-sm text-gray-600">Setup WhatsApp and email alerts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
