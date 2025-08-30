import React from 'react';
import { 
  CurrencyRupeeIcon, 
  ShoppingCartIcon, 
  CubeIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  // Mock data - in real app, this would come from API
  const stats = [
    {
      name: 'Today\'s Sales',
      value: '₹12,450',
      change: '+12.5%',
      changeType: 'positive',
      icon: CurrencyRupeeIcon,
    },
    {
      name: 'Orders Today',
      value: '45',
      change: '+8.2%',
      changeType: 'positive',
      icon: ShoppingCartIcon,
    },
    {
      name: 'Low Stock Items',
      value: '3',
      change: '-2',
      changeType: 'negative',
      icon: CubeIcon,
    },
    {
      name: 'Avg Order Value',
      value: '₹276',
      change: '+5.1%',
      changeType: 'positive',
      icon: ChartBarIcon,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">from yesterday</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((order) => (
              <div key={order} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Order #{1000 + order}</p>
                  <p className="text-sm text-gray-600">2 items • ₹450</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
          <div className="space-y-3">
            {['Fresh Mango', 'Hazelnuts', 'White Chocolate'].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item}</p>
                  <p className="text-sm text-red-600">Low stock</p>
                </div>
                <button className="px-3 py-1 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  Reorder
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Items</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {['Choco Tsunami', 'Mango Tsunami', 'Hazelnut Kunafa', 'Pista Crispy Rice'].map((item) => (
            <div key={item} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-lg">🍦</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{item}</p>
              <p className="text-xs text-gray-600">₹189</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
