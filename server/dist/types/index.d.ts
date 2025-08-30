export interface User {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'cashier';
    password_hash: string;
    created_at: string;
    updated_at: string;
    last_login?: string;
    is_active: boolean;
}
export interface Category {
    id: string;
    name: string;
    description?: string;
    color?: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface Product {
    id: string;
    name: string;
    description?: string;
    category_id: string;
    price: number;
    cost_price: number;
    image_url?: string;
    is_available: boolean;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    recipe?: ProductRecipe[];
}
export interface ProductRecipe {
    id: string;
    product_id: string;
    inventory_item_id: string;
    quantity: number;
    unit: string;
}
export interface InventoryItem {
    id: string;
    name: string;
    description?: string;
    category: string;
    current_stock: number;
    min_stock: number;
    max_stock: number;
    unit: string;
    cost_per_unit: number;
    supplier?: string;
    expiry_date?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface Order {
    id: string;
    order_number: string;
    order_type: 'dine_in' | 'takeaway' | 'zomato' | 'swiggy';
    customer_name?: string;
    customer_phone?: string;
    table_number?: number;
    items: OrderItem[];
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    discount_type?: 'percentage' | 'flat';
    discount_percentage?: number;
    total_amount: number;
    payment_method: 'cash' | 'card' | 'digital';
    payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
    transaction_id?: string;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    notes?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
    is_synced: boolean;
}
export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes?: string;
    created_at: string;
}
export interface Transaction {
    id: string;
    order_id: string;
    amount: number;
    payment_method: 'cash' | 'card' | 'digital';
    payment_gateway?: string;
    transaction_id?: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    gateway_response?: any;
    created_at: string;
    updated_at: string;
}
export interface Integration {
    id: string;
    platform: 'zomato' | 'swiggy' | 'paytm';
    api_key: string;
    api_secret?: string;
    webhook_url?: string;
    is_active: boolean;
    last_sync?: string;
    created_at: string;
    updated_at: string;
}
export interface ExternalOrder {
    id: string;
    platform: 'zomato' | 'swiggy';
    platform_order_id: string;
    customer_name: string;
    customer_phone: string;
    customer_address?: string;
    items: ExternalOrderItem[];
    total_amount: number;
    delivery_fee: number;
    platform_fee: number;
    status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    order_time: string;
    delivery_time?: string;
    created_at: string;
    updated_at: string;
    is_processed: boolean;
    local_order_id?: string;
}
export interface ExternalOrderItem {
    id: string;
    external_order_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes?: string;
}
export interface PrinterConfig {
    id: string;
    name: string;
    type: 'thermal' | 'inkjet' | 'laser';
    connection: 'usb' | 'bluetooth' | 'network';
    port?: string;
    ip_address?: string;
    baud_rate?: number;
    is_default: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface Alert {
    id: string;
    type: 'low_stock' | 'expiry' | 'reorder' | 'system';
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    is_read: boolean;
    is_sent: boolean;
    sent_via: 'email' | 'whatsapp' | 'both';
    created_at: string;
    updated_at: string;
}
export interface SyncLog {
    id: string;
    entity_type: 'order' | 'inventory' | 'product' | 'user';
    entity_id: string;
    action: 'create' | 'update' | 'delete';
    status: 'pending' | 'success' | 'failed';
    error_message?: string;
    created_at: string;
    synced_at?: string;
}
export interface LoginRequest {
    username: string;
    password: string;
}
export interface LoginResponse {
    user: Omit<User, 'password_hash'>;
    token: string;
    expires_in: number;
}
export interface CreateOrderRequest {
    order_type: Order['order_type'];
    customer_name?: string;
    customer_phone?: string;
    table_number?: number;
    items: Array<{
        product_id: string;
        quantity: number;
        notes?: string;
    }>;
    discount_type?: 'percentage' | 'flat';
    discount_value?: number;
    discount?: number;
    tax?: number;
    payment_method: Order['payment_method'];
    payment_status?: Order['payment_status'];
    status?: Order['status'];
    notes?: string;
}
export interface UpdateOrderRequest {
    order_type?: Order['order_type'];
    customer_name?: string;
    customer_phone?: string;
    status?: Order['status'];
    items?: Array<{
        product_id: string;
        quantity: number;
        notes?: string;
    }>;
    discount_type?: 'percentage' | 'flat';
    discount_value?: number;
    discount?: number;
    tax?: number;
    subtotal?: number;
    total?: number;
    payment_method?: Order['payment_method'];
    payment_status?: Order['payment_status'];
    notes?: string;
}
export interface CreateProductRequest {
    name: string;
    description?: string;
    category_id: string;
    price: number;
    cost_price: number;
    image_url?: string;
    sort_order?: number;
    recipe?: Array<{
        inventory_item_id: string;
        quantity: number;
        unit: string;
    }>;
}
export interface UpdateProductRequest {
    name?: string;
    description?: string;
    category_id?: string;
    price?: number;
    cost_price?: number;
    image_url?: string;
    is_available?: boolean;
    is_active?: boolean;
    sort_order?: number;
    recipe?: Array<{
        inventory_item_id: string;
        quantity: number;
        unit: string;
    }>;
}
export interface CreateInventoryItemRequest {
    name: string;
    description?: string;
    category_id: string;
    current_stock: number;
    min_stock_level: number;
    max_stock_level: number;
    unit_cost: number;
    unit_price?: number;
    supplier_info?: string;
    expiry_date?: string;
}
export interface UpdateInventoryItemRequest {
    name?: string;
    description?: string;
    category_id?: string;
    min_stock_level?: number;
    max_stock_level?: number;
    unit_cost?: number;
    unit_price?: number;
    supplier_info?: string;
    expiry_date?: string;
}
export interface StockTransaction {
    id: string;
    inventory_item_id: string;
    transaction_type: 'stock_in' | 'stock_out' | 'initial_stock' | 'adjustment';
    quantity: number;
    unit_cost: number;
    total_cost: number;
    notes?: string;
    created_at: string;
}
export interface StockAlert {
    id: string;
    inventory_item_id: string;
    alert_type: 'low_stock' | 'expiry' | 'overstock';
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    is_read: boolean;
    created_at: string;
}
export interface ReorderReminder {
    id: string;
    inventory_item_id: string;
    suggested_quantity: number;
    reason: string;
    priority: 'low' | 'medium' | 'high';
    is_processed: boolean;
    created_at: string;
    processed_at?: string;
}
export interface DashboardStats {
    today_sales: number;
    today_orders: number;
    today_profit: number;
    low_stock_items: number;
    pending_orders: number;
    monthly_sales: number;
    monthly_orders: number;
    monthly_profit: number;
}
export interface SalesReport {
    date: string;
    total_sales: number;
    total_orders: number;
    total_profit: number;
    payment_methods: {
        cash: number;
        card: number;
        digital: number;
    };
    top_products: Array<{
        product_name: string;
        quantity: number;
        revenue: number;
    }>;
}
export interface WebSocketMessage {
    type: 'order_update' | 'inventory_update' | 'alert' | 'sync_status';
    data: any;
    timestamp: string;
}
export interface OfflineData {
    orders: Order[];
    inventory_updates: Array<{
        item_id: string;
        quantity_change: number;
        reason: string;
        timestamp: string;
    }>;
    sync_logs: SyncLog[];
}
//# sourceMappingURL=index.d.ts.map