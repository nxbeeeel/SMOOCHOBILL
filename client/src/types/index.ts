// User and Authentication Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'cashier';
  created_at: string;
  last_login?: string;
  is_active: boolean;
  token?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  expires_in: number;
}

// Product and Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  sort_order: number;
  image_url?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  price: number;
  cost_price: number;
  sort_order: number;
  image_url?: string;
  is_available: boolean;
  category?: Category;
  category_name?: string;
  category_color?: string;
}

// Order Types
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  product?: Product;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name?: string;
  customer_phone?: string;
  order_type: 'dine_in' | 'takeaway' | 'zomato' | 'swiggy';
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  subtotal: number;
  discount_amount: number;
  discount_type: 'percentage' | 'flat';
  tax_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'online';
  payment_status: 'pending' | 'completed' | 'failed';
  created_by: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  user?: User;
}

export interface CreateOrderRequest {
  customer_name?: string;
  customer_phone?: string;
  order_type: 'dine_in' | 'takeaway' | 'zomato' | 'swiggy';
  items: {
    product_id: string;
    quantity: number;
    notes?: string;
  }[];
  discount_amount?: number;
  discount_type?: 'percentage' | 'flat';
  payment_method: 'cash' | 'card' | 'online';
}

export interface UpdateOrderRequest {
  customer_name?: string;
  customer_phone?: string;
  order_type?: 'dine_in' | 'takeaway' | 'zomato' | 'swiggy';
  items?: {
    product_id: string;
    quantity: number;
    notes?: string;
  }[];
  discount_amount?: number;
  discount_type?: 'percentage' | 'flat';
  payment_method?: 'cash' | 'card' | 'online';
  status?: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  payment_status?: 'pending' | 'completed' | 'failed';
}

// Inventory Types
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  cost_per_unit: number;
  expiry_date?: string;
  supplier?: string;
  last_updated: string;
}

export interface ProductRecipe {
  id: string;
  product_id: string;
  inventory_item_id: string;
  quantity: number;
  unit: string;
  inventory_item?: InventoryItem;
}

// Report Types
export interface SalesReport {
  date: string;
  total_orders: number;
  total_sales: number;
  total_items_sold: number;
  average_order_value: number;
  payment_methods: {
    cash: number;
    card: number;
    online: number;
  };
}

export interface InventoryReport {
  item_id: string;
  item_name: string;
  current_stock: number;
  min_stock: number;
  usage_today: number;
  usage_this_month: number;
  reorder_needed: boolean;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'order_update' | 'inventory_update' | 'alert' | 'sync_status';
  data: any;
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Menu-specific types based on Smoocho menu
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category: 'signatures' | 'choco_desserts' | 'crispy_rice_tubs' | 'kunafa_bowls' | 'fruits_choco_mix' | 'choco_icecreams' | 'drinks';
  price: number;
  classic_price?: number;
  premium_price?: number;
  image_url: string;
  is_available: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  toppings?: string[];
  add_ons?: {
    name: string;
    price: number;
  }[];
}

// Printer Types
export interface PrinterConfig {
  id: string;
  name: string;
  type: 'thermal' | 'network' | 'usb';
  connection_string: string;
  paper_width: number;
  is_active: boolean;
}

// Integration Types
export interface ZomatoOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total_amount: number;
  order_time: string;
}

export interface SwiggyOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total_amount: number;
  order_time: string;
}

// Settings Types
export interface AppSettings {
  shop_name: string;
  shop_address: string;
  shop_phone: string;
  shop_email: string;
  tax_rate: number;
  currency: string;
  timezone: string;
  auto_print: boolean;
  low_stock_threshold: number;
  email_notifications: boolean;
  whatsapp_notifications: boolean;
}

// Offline Types
export interface OfflineData {
  orders: Order[];
  inventory_updates: any[];
  last_sync: string;
}

// Form Types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  category_id: string;
  price: number;
  cost_price: number;
  image?: File;
}

export interface InventoryFormData {
  name: string;
  category: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  cost_per_unit: number;
  expiry_date?: string;
  supplier?: string;
}
