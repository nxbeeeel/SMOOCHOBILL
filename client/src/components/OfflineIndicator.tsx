import React from 'react';
import { WifiIcon } from '@heroicons/react/24/outline';

interface OfflineIndicatorProps {
  isOnline: boolean;
  className?: string;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  isOnline, 
  className = '' 
}) => {
  if (isOnline) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <WifiIcon className="w-4 h-4" />
        <span className="text-sm font-medium">Offline Mode</span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
