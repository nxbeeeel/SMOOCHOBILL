-- Smoocho POS Database Schema
-- SQLite Database for local storage and offline functionality

-- Users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK(role IN ('admin', 'cashier')) NOT NULL DEFAULT 'cashier',
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login TEXT,
    is_active BOOLEAN NOT NULL DEFAULT 1
);

-- Categories for organizing products
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Products/Menu items
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category_id TEXT NOT NULL,
    price REAL NOT NULL CHECK(price >= 0),
    cost_price REAL NOT NULL CHECK(cost_price >= 0),
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Product recipes for inventory deduction
CREATE TABLE IF NOT EXISTS product_recipes (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    inventory_item_id TEXT NOT NULL,
    quantity REAL NOT NULL CHECK(quantity > 0),
    unit TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

-- Inventory items for stock management
CREATE TABLE IF NOT EXISTS inventory_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category_id TEXT NOT NULL,
    current_stock REAL NOT NULL DEFAULT 0 CHECK(current_stock >= 0),
    min_stock_level REAL NOT NULL DEFAULT 0 CHECK(min_stock_level >= 0),
    max_stock_level REAL NOT NULL DEFAULT 0 CHECK(max_stock_level >= 0),
    unit_cost REAL NOT NULL DEFAULT 0 CHECK(unit_cost >= 0),
    unit_price REAL,
    supplier_info TEXT,
    expiry_date TEXT,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    order_type TEXT CHECK(order_type IN ('dine_in', 'takeaway', 'zomato', 'swiggy')) NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    table_number INTEGER,
    subtotal REAL NOT NULL DEFAULT 0 CHECK(subtotal >= 0),
    tax_amount REAL NOT NULL DEFAULT 0 CHECK(tax_amount >= 0),
    discount_amount REAL NOT NULL DEFAULT 0 CHECK(discount_amount >= 0),
    discount_type TEXT CHECK(discount_type IN ('percentage', 'flat')),
    discount_percentage REAL CHECK(discount_percentage >= 0 AND discount_percentage <= 100),
    total_amount REAL NOT NULL DEFAULT 0 CHECK(total_amount >= 0),
    payment_method TEXT CHECK(payment_method IN ('cash', 'card', 'digital')) NOT NULL,
    payment_status TEXT CHECK(payment_status IN ('pending', 'completed', 'failed', 'refunded')) NOT NULL DEFAULT 'pending',
    transaction_id TEXT,
    status TEXT CHECK(status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    is_synced BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_price REAL NOT NULL CHECK(unit_price >= 0),
    total_price REAL NOT NULL CHECK(total_price >= 0),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Transactions for payment tracking
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    amount REAL NOT NULL CHECK(amount >= 0),
    payment_method TEXT CHECK(payment_method IN ('cash', 'card', 'digital')) NOT NULL,
    payment_gateway TEXT,
    transaction_id TEXT,
    status TEXT CHECK(status IN ('pending', 'completed', 'failed', 'refunded')) NOT NULL DEFAULT 'pending',
    gateway_response TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- External platform integrations
CREATE TABLE IF NOT EXISTS integrations (
    id TEXT PRIMARY KEY,
    platform TEXT CHECK(platform IN ('zomato', 'swiggy', 'paytm')) NOT NULL,
    api_key TEXT NOT NULL,
    api_secret TEXT,
    webhook_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    last_sync TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- External orders from delivery platforms
CREATE TABLE IF NOT EXISTS external_orders (
    id TEXT PRIMARY KEY,
    platform TEXT CHECK(platform IN ('zomato', 'swiggy')) NOT NULL,
    platform_order_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT,
    total_amount REAL NOT NULL CHECK(total_amount >= 0),
    delivery_fee REAL NOT NULL DEFAULT 0 CHECK(delivery_fee >= 0),
    platform_fee REAL NOT NULL DEFAULT 0 CHECK(platform_fee >= 0),
    status TEXT CHECK(status IN ('pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled')) NOT NULL DEFAULT 'pending',
    order_time TEXT NOT NULL,
    delivery_time TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    is_processed BOOLEAN NOT NULL DEFAULT 0,
    local_order_id TEXT,
    FOREIGN KEY (local_order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- External order items
CREATE TABLE IF NOT EXISTS external_order_items (
    id TEXT PRIMARY KEY,
    external_order_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_price REAL NOT NULL CHECK(unit_price >= 0),
    total_price REAL NOT NULL CHECK(total_price >= 0),
    notes TEXT,
    FOREIGN KEY (external_order_id) REFERENCES external_orders(id) ON DELETE CASCADE
);

-- Printer configurations
CREATE TABLE IF NOT EXISTS printer_configs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('thermal', 'inkjet', 'laser')) NOT NULL,
    connection TEXT CHECK(connection IN ('usb', 'bluetooth', 'network')) NOT NULL,
    port TEXT,
    ip_address TEXT,
    baud_rate INTEGER,
    is_default BOOLEAN NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Alerts and notifications
CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    type TEXT CHECK(type IN ('low_stock', 'expiry', 'reorder', 'system')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT CHECK(severity IN ('info', 'warning', 'error', 'critical')) NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT 0,
    is_sent BOOLEAN NOT NULL DEFAULT 0,
    sent_via TEXT CHECK(sent_via IN ('email', 'whatsapp', 'both')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sync logs for offline/online synchronization
CREATE TABLE IF NOT EXISTS sync_logs (
    id TEXT PRIMARY KEY,
    entity_type TEXT CHECK(entity_type IN ('order', 'inventory', 'product', 'user')) NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT CHECK(action IN ('create', 'update', 'delete')) NOT NULL,
    status TEXT CHECK(status IN ('pending', 'success', 'failed')) NOT NULL DEFAULT 'pending',
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    synced_at TEXT
);

-- Inventory transactions for audit trail
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id TEXT PRIMARY KEY,
    inventory_item_id TEXT NOT NULL,
    transaction_type TEXT CHECK(transaction_type IN ('purchase', 'sale', 'adjustment', 'waste', 'transfer')) NOT NULL,
    quantity_change REAL NOT NULL,
    previous_stock REAL NOT NULL,
    new_stock REAL NOT NULL,
    reason TEXT NOT NULL,
    reference_id TEXT,
    reference_type TEXT,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Stock transactions for inventory management
CREATE TABLE IF NOT EXISTS stock_transactions (
    id TEXT PRIMARY KEY,
    inventory_item_id TEXT NOT NULL,
    transaction_type TEXT CHECK(transaction_type IN ('stock_in', 'stock_out', 'initial_stock', 'adjustment')) NOT NULL,
    quantity REAL NOT NULL,
    unit_cost REAL NOT NULL CHECK(unit_cost >= 0),
    total_cost REAL NOT NULL CHECK(total_cost >= 0),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_is_synced ON orders(is_synced);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_inventory_items_current_stock ON inventory_items(current_stock);
CREATE INDEX IF NOT EXISTS idx_inventory_items_expiry_date ON inventory_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_entity_type ON sync_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_inventory_item_id ON stock_transactions(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_created_at ON stock_transactions(created_at);

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (id, username, email, role, password_hash, is_active) 
VALUES (
    'admin-001', 
    'admin', 
    'admin@smoocho.com', 
    'admin', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    1
);

-- Insert default categories
INSERT OR IGNORE INTO categories (id, name, description, color, sort_order) VALUES
('cat-001', 'Ice Creams', 'Various flavors of ice creams', '#FF6B6B', 1),
('cat-002', 'Milkshakes', 'Delicious milkshakes', '#4ECDC4', 2),
('cat-003', 'Sundaes', 'Ice cream sundaes with toppings', '#45B7D1', 3),
('cat-004', 'Beverages', 'Cold and hot beverages', '#96CEB4', 4),
('cat-005', 'Snacks', 'Quick bites and snacks', '#FFEAA7', 5),
('cat-006', 'Dairy', 'Milk and dairy products', '#A8E6CF', 6),
('cat-007', 'Ingredients', 'Raw ingredients and additives', '#FFB3BA', 7),
('cat-008', 'Packaging', 'Containers and packaging materials', '#FFDAC1', 8);

-- Insert sample products
INSERT OR IGNORE INTO products (id, name, description, category_id, price, cost_price, sort_order) VALUES
('prod-001', 'Vanilla Ice Cream', 'Classic vanilla ice cream', 'cat-001', 80.00, 40.00, 1),
('prod-002', 'Chocolate Ice Cream', 'Rich chocolate ice cream', 'cat-001', 90.00, 45.00, 2),
('prod-003', 'Strawberry Milkshake', 'Fresh strawberry milkshake', 'cat-002', 120.00, 60.00, 1),
('prod-004', 'Chocolate Sundae', 'Chocolate sundae with nuts', 'cat-003', 150.00, 75.00, 1),
('prod-005', 'Cold Coffee', 'Iced coffee with cream', 'cat-004', 100.00, 50.00, 1);

-- Insert sample inventory items
INSERT OR IGNORE INTO inventory_items (id, name, category_id, current_stock, min_stock_level, max_stock_level, unit_cost, unit_price) VALUES
('inv-001', 'Milk', 'cat-006', 50.0, 10.0, 100.0, 60.00, 70.00),
('inv-002', 'Sugar', 'cat-007', 20.0, 5.0, 50.0, 45.00, 50.00),
('inv-003', 'Vanilla Extract', 'cat-007', 5.0, 1.0, 10.0, 200.00, 250.00),
('inv-004', 'Chocolate Syrup', 'cat-007', 10.0, 2.0, 20.0, 150.00, 180.00),
('inv-005', 'Ice Cream Cones', 'cat-008', 200.0, 50.0, 500.0, 2.00, 3.00);

-- Insert sample product recipes
INSERT OR IGNORE INTO product_recipes (id, product_id, inventory_item_id, quantity, unit) VALUES
('rec-001', 'prod-001', 'inv-001', 0.5, 'L'),
('rec-001', 'prod-001', 'inv-002', 0.1, 'kg'),
('rec-001', 'prod-001', 'inv-003', 0.01, 'L'),
('rec-002', 'prod-002', 'inv-001', 0.5, 'L'),
('rec-002', 'prod-002', 'inv-002', 0.1, 'kg'),
('rec-002', 'prod-002', 'inv-004', 0.05, 'L');

-- Insert default printer configuration
INSERT OR IGNORE INTO printer_configs (id, name, type, connection, port, is_default, is_active) 
VALUES ('printer-001', 'Default Thermal Printer', 'thermal', 'usb', 'USB001', 1, 1);
