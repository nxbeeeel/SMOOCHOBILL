import axios from 'axios';
import { Order, CreateOrderRequest, UpdateOrderRequest } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with auth interceptor
const orderApi = axios.create({
  baseURL: `${API_BASE_URL}/orders`,
});

// Add auth token to requests
orderApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const orderService = {
  // Get all orders
  getAllOrders: async (params?: {
    status?: string;
    payment_method?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<Order[]> => {
    const response = await orderApi.get('/', { params });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<Order> => {
    const response = await orderApi.get(`/${id}`);
    return response.data;
  },

  // Create new order
  createOrder: async (orderData: CreateOrderRequest): Promise<{ id: string; message: string; total: number }> => {
    const response = await orderApi.post('/', orderData);
    return response.data;
  },

  // Update order
  updateOrder: async (id: string, updateData: UpdateOrderRequest): Promise<{ message: string }> => {
    const response = await orderApi.put(`/${id}`, updateData);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id: string): Promise<{ message: string }> => {
    const response = await orderApi.delete(`/${id}`);
    return response.data;
  },

  // Get daily summary
  getDailySummary: async (date?: string): Promise<{
    date: string;
    summary: {
      total_orders: number;
      total_sales: number;
      cash_sales: number;
      card_sales: number;
      online_sales: number;
      total_discounts: number;
      total_tax: number;
    };
    top_products: Array<{
      name: string;
      total_quantity: number;
      total_revenue: number;
    }>;
  }> => {
    const response = await orderApi.get('/summary/daily', { params: { date } });
    return response.data;
  },
};
