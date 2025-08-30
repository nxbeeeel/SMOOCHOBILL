import { Request, Response } from 'express';
import databaseManager from '../database';
import { Order, OrderItem, CreateOrderRequest, UpdateOrderRequest } from '../types';

// Get all orders with items
export const getAllOrders = async (req: Request, res: Response) => {
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
      
      const params: any[] = [];
      
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
      params.push(parseInt(limit as string), parseInt(offset as string));
      
      const orders = await databaseManager.all(query, params);
      
      // Get items for each order
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
        order.items = await databaseManager.all(itemsQuery, [order.id]);
      }
      
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

// Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
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
      
      const order = await databaseManager.get(orderQuery, [id]);
      
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      
      // Get order items
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
      
      order.items = await databaseManager.all(itemsQuery, [id]);
      
      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  }

// Create new order
export const createOrder = async (req: Request, res: Response) => {
    try {
      const orderData: CreateOrderRequest = req.body;
      const userId = (req as any).user.id;
      
      // Validate required fields
      if (!orderData.items || orderData.items.length === 0) {
        res.status(400).json({ error: 'Order must contain at least one item' });
        return;
      }

      const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate totals
      let subtotal = 0;
      for (const item of orderData.items) {
        const product = await databaseManager.get('SELECT price FROM products WHERE id = ?', [item.product_id]);
        if (!product) {
          res.status(400).json({ error: `Product ${item.product_id} not found` });
          return;
        }
        subtotal += product.price * item.quantity;
      }
      
      const discount = orderData.discount || 0;
      const tax = orderData.tax || 0;
      const total = subtotal - discount + tax;
      
      // Create order
      const orderQuery = `
        INSERT INTO orders (
          id, order_type, customer_name, customer_phone, 
          subtotal, discount, tax, total, payment_method, 
          payment_status, status, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await databaseManager.run(orderQuery, [
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
      
      // Create order items
      for (const item of orderData.items) {
        const itemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const itemQuery = `
          INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const product = await databaseManager.get('SELECT price FROM products WHERE id = ?', [item.product_id]);
        const itemTotal = product.price * item.quantity;
        
        await databaseManager.run(itemQuery, [
          itemId,
          orderId,
          item.product_id,
          item.quantity,
          product.price,
          itemTotal
        ]);
      }
      
      // Deduct inventory (recipe-based)
      // TODO: Implement inventory deduction logic
      
      res.status(201).json({ 
        id: orderId, 
        message: 'Order created successfully',
        total: total
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }

// Update order
export const updateOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData: UpdateOrderRequest = req.body;
      const userId = (req as any).user.id;
      
      // Check if order exists
      const existingOrder = await databaseManager.get('SELECT * FROM orders WHERE id = ?', [id]);
      if (!existingOrder) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      
      // Check if order is old (more than 24 hours) - requires admin
      const orderAge = Date.now() - new Date(existingOrder.created_at).getTime();
      const isOldOrder = orderAge > 24 * 60 * 60 * 1000; // 24 hours
      
      if (isOldOrder && (req as any).user.role !== 'admin') {
        res.status(403).json({ error: 'Only admins can edit orders older than 24 hours' });
        return;
      }

      // Update order
      const updateQuery = `
        UPDATE orders 
        SET order_type = ?, customer_name = ?, customer_phone = ?, 
            subtotal = ?, discount = ?, tax = ?, total = ?, 
            payment_method = ?, payment_status = ?, status = ?, 
            notes = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await databaseManager.run(updateQuery, [
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
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  }

// Cancel order
export const cancelOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      
      // Check if order exists
      const existingOrder = await databaseManager.get('SELECT * FROM orders WHERE id = ?', [id]);
      if (!existingOrder) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      
      if (existingOrder.status === 'cancelled') {
        res.status(400).json({ error: 'Order is already cancelled' });
        return;
      }
      
      // Update order status
      await databaseManager.run(
        'UPDATE orders SET status = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['cancelled', userId, id]
      );
      
      // Restore inventory
      const items = await databaseManager.all('SELECT * FROM order_items WHERE order_id = ?', [id]);
      // TODO: Implement inventory restoration logic
      
      res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ error: 'Failed to cancel order' });
    }
  }

// Get daily summary
export const getDailySummary = async (req: Request, res: Response) => {
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
      
      const summary = await databaseManager.get(query, [targetDate]);
      
      // Get top selling products
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
      
      const topProducts = await databaseManager.all(topProductsQuery, [targetDate]);
      
      res.json({
        date: targetDate,
        summary,
        top_products: topProducts
      });
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      res.status(500).json({ error: 'Failed to fetch daily summary' });
    }
  }