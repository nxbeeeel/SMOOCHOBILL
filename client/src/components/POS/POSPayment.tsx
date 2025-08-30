import React, { useState } from 'react';
import { Product } from '../../types';
import { XMarkIcon, CreditCardIcon, BanknotesIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

interface CartItem {
  product: Product;
  quantity: number;
}

interface POSPaymentProps {
  cart: CartItem[];
  total: number;
  onCompletePayment: () => void;
  onCancel: () => void;
}

type PaymentMethod = 'cash' | 'card' | 'online';
type OrderType = 'dine_in' | 'takeaway' | 'zomato' | 'swiggy';

const POSPayment: React.FC<POSPaymentProps> = ({
  cart,
  total,
  onCompletePayment,
  onCancel,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        order_type: orderType,
        customer_name: customerName,
        customer_phone: customerPhone,
        payment_method: paymentMethod,
        notes: notes,
        discount: 0, // TODO: Add discount functionality
        tax: total * 0.05, // 5% tax
      };
      
      const result = await orderService.createOrder(orderData);
      
      toast.success(`Order completed! Order ID: ${result.id}`);
      
      // TODO: Print bill
      // TODO: Send to thermal printer
      
      onCompletePayment();
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-medium">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Type */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'dine_in', label: 'Dine In' },
                { value: 'takeaway', label: 'Takeaway' },
                { value: 'zomato', label: 'Zomato' },
                { value: 'swiggy', label: 'Swiggy' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setOrderType(type.value as OrderType)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    orderType === type.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Customer Info</h3>
            <input
              type="text"
              placeholder="Customer Name (Optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Phone Number (Optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Method</h3>
            <div className="space-y-2">
              {[
                { value: 'cash', label: 'Cash', icon: BanknotesIcon },
                { value: 'card', label: 'Card', icon: CreditCardIcon },
                { value: 'online', label: 'Online', icon: DevicePhoneMobileIcon },
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value as PaymentMethod)}
                  className={`w-full p-3 rounded-lg border flex items-center space-x-3 transition-colors ${
                    paymentMethod === method.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <method.icon className="w-5 h-5" />
                  <span className="font-medium">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
            <textarea
              placeholder="Add any special instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Complete Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSPayment;
