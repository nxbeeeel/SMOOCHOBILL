"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailySummary = exports.cancelOrder = exports.updateOrder = exports.createOrder = exports.getOrderById = exports.getAllOrders = void 0;
const database_1 = __importDefault(require("../database"));
const getAllOrders = async (req, res) => {
    try {
        const { status, payment_method, start_date, end_date, limit = '50', offset = '0' } = req.query;
        let query = `
        SELECT 
          o.*,
          u.username as created_by_username
        FROM orders o
        LEFT JOIN users u ON o.created_by = u.id
        WHERE 1=1
      `;
        const params = [];
        if (status) {
            query += ` AND o.status = ?`;
            params.push(status);
        }
        if (payment_method) {
            query += ` AND o.payment_method = ?`;
            params.push(payment_method);
        }
        if (start_date) {
            query += ` AND DATE(o.created_at) >= ?`;
            params.push(start_date);
        }
        if (end_date) {
            query += ` AND DATE(o.created_at) <= ?`;
            params.push(end_date);
        }
        query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        const orders = await database_1.default.all(query, params);
        for (const order of orders) {
            const itemsQuery = `
          SELECT 
            oi.*,
            p.name as product_name,
            p.price as product_price
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `;
            order.items = await database_1.default.all(itemsQuery, [order.id]);
        }
        res.json(orders);
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
exports.getAllOrders = getAllOrders;
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const orderQuery = `
        SELECT 
          o.*,
          u.username as created_by_username
        FROM orders o
        LEFT JOIN users u ON o.created_by = u.id
        WHERE o.id = ?
      `;
        const order = await database_1.default.get(orderQuery, [id]);
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        const itemsQuery = `
        SELECT 
          oi.*,
          p.name as product_name,
          p.price as product_price,
          p.description as product_description
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `;
        order.items = await database_1.default.all(itemsQuery, [id]);
        res.json(order);
    }
    catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};
exports.getOrderById = getOrderById;
const createOrder = async (req, res) => {
    try {
        const orderData = req.body;
        const userId = req.user.id;
        if (!orderData.items || orderData.items.length === 0) {
            res.status(400).json({ error: 'Order must contain at least one item' });
            return;
        }
        const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        let subtotal = 0;
        for (const item of orderData.items) {
            const product = await database_1.default.get('SELECT price FROM products WHERE id = ?', [item.product_id]);
            if (!product) {
                res.status(400).json({ error: `Product ${item.product_id} not found` });
                return;
            }
            subtotal += product.price * item.quantity;
        }
        const discount = orderData.discount || 0;
        const tax = orderData.tax || 0;
        const total = subtotal - discount + tax;
        const orderQuery = `
        INSERT INTO orders (
          id, order_type, customer_name, customer_phone, 
          subtotal, discount, tax, total, payment_method, 
          payment_status, status, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
        await database_1.default.run(orderQuery, [
            orderId,
            orderData.order_type || 'dine_in',
            orderData.customer_name || '',
            orderData.customer_phone || '',
            subtotal,
            discount,
            tax,
            total,
            orderData.payment_method || 'cash',
            orderData.payment_status || 'pending',
            orderData.status || 'pending',
            orderData.notes || '',
            userId
        ]);
        for (const item of orderData.items) {
            const itemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const itemQuery = `
          INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
            const product = await database_1.default.get('SELECT price FROM products WHERE id = ?', [item.product_id]);
            const itemTotal = product.price * item.quantity;
            await database_1.default.run(itemQuery, [
                itemId,
                orderId,
                item.product_id,
                item.quantity,
                product.price,
                itemTotal
            ]);
        }
        res.status(201).json({
            id: orderId,
            message: 'Order created successfully',
            total: total
        });
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};
exports.createOrder = createOrder;
const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const userId = req.user.id;
        const existingOrder = await database_1.default.get('SELECT * FROM orders WHERE id = ?', [id]);
        if (!existingOrder) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        const orderAge = Date.now() - new Date(existingOrder.created_at).getTime();
        const isOldOrder = orderAge > 24 * 60 * 60 * 1000;
        if (isOldOrder && req.user.role !== 'admin') {
            res.status(403).json({ error: 'Only admins can edit orders older than 24 hours' });
            return;
        }
        const updateQuery = `
        UPDATE orders 
        SET order_type = ?, customer_name = ?, customer_phone = ?, 
            subtotal = ?, discount = ?, tax = ?, total = ?, 
            payment_method = ?, payment_status = ?, status = ?, 
            notes = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
        await database_1.default.run(updateQuery, [
            updateData.order_type || existingOrder.order_type,
            updateData.customer_name || existingOrder.customer_name,
            updateData.customer_phone || existingOrder.customer_phone,
            updateData.subtotal || existingOrder.subtotal,
            updateData.discount || existingOrder.discount,
            updateData.tax || existingOrder.tax,
            updateData.total || existingOrder.total,
            updateData.payment_method || existingOrder.payment_method,
            updateData.payment_status || existingOrder.payment_status,
            updateData.status || existingOrder.status,
            updateData.notes || existingOrder.notes,
            userId,
            id
        ]);
        res.json({ message: 'Order updated successfully' });
    }
    catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Failed to update order' });
    }
};
exports.updateOrder = updateOrder;
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const existingOrder = await database_1.default.get('SELECT * FROM orders WHERE id = ?', [id]);
        if (!existingOrder) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        if (existingOrder.status === 'cancelled') {
            res.status(400).json({ error: 'Order is already cancelled' });
            return;
        }
        await database_1.default.run('UPDATE orders SET status = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['cancelled', userId, id]);
        const items = await database_1.default.all('SELECT * FROM order_items WHERE order_id = ?', [id]);
        res.json({ message: 'Order cancelled successfully' });
    }
    catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
};
exports.cancelOrder = cancelOrder;
const getDailySummary = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];
        const query = `
        SELECT 
          COUNT(*) as total_orders,
          SUM(total) as total_sales,
          SUM(CASE WHEN payment_method = 'cash' THEN total ELSE 0 END) as cash_sales,
          SUM(CASE WHEN payment_method = 'card' THEN total ELSE 0 END) as card_sales,
          SUM(CASE WHEN payment_method = 'online' THEN total ELSE 0 END) as online_sales,
          SUM(discount) as total_discounts,
          SUM(tax) as total_tax
        FROM orders 
        WHERE DATE(created_at) = ? AND status != 'cancelled'
      `;
        const summary = await database_1.default.get(query, [targetDate]);
        const topProductsQuery = `
        SELECT 
          p.name,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.total_price) as total_revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE DATE(o.created_at) = ? AND o.status != 'cancelled'
        GROUP BY p.id, p.name
        ORDER BY total_quantity DESC
        LIMIT 10
      `;
        const topProducts = await database_1.default.all(topProductsQuery, [targetDate]);
        res.json({
            date: targetDate,
            summary,
            top_products: topProducts
        });
    }
    catch (error) {
        console.error('Error fetching daily summary:', error);
        res.status(500).json({ error: 'Failed to fetch daily summary' });
    }
};
exports.getDailySummary = getDailySummary;
//# sourceMappingURL=orderController.js.map