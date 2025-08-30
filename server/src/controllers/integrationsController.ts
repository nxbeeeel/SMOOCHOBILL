import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import databaseManager from '../database';
import { createError } from '../middleware/errorHandler';
import axios from 'axios';

// Zomato Integration
export const syncZomatoOrders = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    const apiKey = process.env.ZOMATO_API_KEY;

    if (!apiKey) {
      throw createError('Zomato API key not configured', 500);
    }

    // Get Zomato orders from their API
    const response = await axios.get('https://developers.zomato.com/api/v2.1/orders', {
      headers: {
        'user-key': apiKey,
        'Accept': 'application/json'
      },
      params: {
        start_date,
        end_date
      }
    });

    const zomatoOrders = response.data.orders || [];

    // Process and sync orders
    const syncedOrders = [];
    for (const zomatoOrder of zomatoOrders) {
      // Check if order already exists
      const existingOrder = await databaseManager.get(
        'SELECT id FROM orders WHERE external_order_id = ? AND order_type = ?',
        [zomatoOrder.order_id, 'zomato']
      );

      if (!existingOrder) {
        // Create new order
        const orderId = uuidv4();
        const now = new Date().toISOString();

        await databaseManager.run(`
          INSERT INTO orders (
            id, order_number, external_order_id, customer_name, customer_phone,
            order_type, subtotal, tax_amount, total_amount, status, payment_status,
            payment_method, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          orderId,
          `ZOM-${zomatoOrder.order_id}`,
          zomatoOrder.order_id,
          zomatoOrder.customer_name,
          zomatoOrder.customer_phone,
          'zomato',
          zomatoOrder.subtotal || 0,
          zomatoOrder.tax || 0,
          zomatoOrder.total_amount || 0,
          'pending',
          'pending',
          'online',
          now,
          now
        ]);

        // Add order items
        if (zomatoOrder.items) {
          for (const item of zomatoOrder.items) {
            await databaseManager.run(`
              INSERT INTO order_items (
                id, order_id, product_id, product_name, quantity, unit_price, total_price, notes
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              uuidv4(),
              orderId,
              item.product_id || 'unknown',
              item.name,
              item.quantity,
              item.price,
              item.total_price,
              item.special_instructions || ''
            ]);
          }
        }

        syncedOrders.push({
          order_id: orderId,
          zomato_order_id: zomatoOrder.order_id,
          status: 'created'
        });
      }
    }

    res.json({
      success: true,
      data: {
        total_orders: zomatoOrders.length,
        synced_orders: syncedOrders.length,
        orders: syncedOrders
      },
      message: 'Zomato orders synced successfully'
    });

  } catch (error) {
    console.error('Sync Zomato orders error:', error);
    throw createError('Failed to sync Zomato orders', 500);
  }
};

export const updateZomatoOrderStatus = async (req: Request, res: Response) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    const apiKey = process.env.ZOMATO_API_KEY;
    if (!apiKey) {
      throw createError('Zomato API key not configured', 500);
    }

    // Get order details
    const order = await databaseManager.get(
      'SELECT external_order_id FROM orders WHERE id = ? AND order_type = ?',
      [order_id, 'zomato']
    );

    if (!order) {
      throw createError('Order not found', 404);
    }

    // Update status on Zomato
    await axios.post(`https://developers.zomato.com/api/v2.1/orders/${order.external_order_id}/status`, {
      status: status
    }, {
      headers: {
        'user-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    // Update local order status
    await databaseManager.run(
      'UPDATE orders SET status = ?, updated_at = ? WHERE id = ?',
      [status, new Date().toISOString(), order_id]
    );

    res.json({
      success: true,
      data: { order_id, status },
      message: 'Zomato order status updated successfully'
    });

  } catch (error) {
    console.error('Update Zomato order status error:', error);
    throw createError('Failed to update Zomato order status', 500);
  }
};

// Swiggy Integration
export const syncSwiggyOrders = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    const apiKey = process.env.SWIGGY_API_KEY;

    if (!apiKey) {
      throw createError('Swiggy API key not configured', 500);
    }

    // Get Swiggy orders from their API
    const response = await axios.get('https://api.swiggy.com/v1/orders', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      params: {
        start_date,
        end_date
      }
    });

    const swiggyOrders = response.data.orders || [];

    // Process and sync orders
    const syncedOrders = [];
    for (const swiggyOrder of swiggyOrders) {
      // Check if order already exists
      const existingOrder = await databaseManager.get(
        'SELECT id FROM orders WHERE external_order_id = ? AND order_type = ?',
        [swiggyOrder.order_id, 'swiggy']
      );

      if (!existingOrder) {
        // Create new order
        const orderId = uuidv4();
        const now = new Date().toISOString();

        await databaseManager.run(`
          INSERT INTO orders (
            id, order_number, external_order_id, customer_name, customer_phone,
            order_type, subtotal, tax_amount, total_amount, status, payment_status,
            payment_method, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          orderId,
          `SWG-${swiggyOrder.order_id}`,
          swiggyOrder.order_id,
          swiggyOrder.customer_name,
          swiggyOrder.customer_phone,
          'swiggy',
          swiggyOrder.subtotal || 0,
          swiggyOrder.tax || 0,
          swiggyOrder.total_amount || 0,
          'pending',
          'pending',
          'online',
          now,
          now
        ]);

        // Add order items
        if (swiggyOrder.items) {
          for (const item of swiggyOrder.items) {
            await databaseManager.run(`
              INSERT INTO order_items (
                id, order_id, product_id, product_name, quantity, unit_price, total_price, notes
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              uuidv4(),
              orderId,
              item.product_id || 'unknown',
              item.name,
              item.quantity,
              item.price,
              item.total_price,
              item.special_instructions || ''
            ]);
          }
        }

        syncedOrders.push({
          order_id: orderId,
          swiggy_order_id: swiggyOrder.order_id,
          status: 'created'
        });
      }
    }

    res.json({
      success: true,
      data: {
        total_orders: swiggyOrders.length,
        synced_orders: syncedOrders.length,
        orders: syncedOrders
      },
      message: 'Swiggy orders synced successfully'
    });

  } catch (error) {
    console.error('Sync Swiggy orders error:', error);
    throw createError('Failed to sync Swiggy orders', 500);
  }
};

export const updateSwiggyOrderStatus = async (req: Request, res: Response) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    const apiKey = process.env.SWIGGY_API_KEY;
    if (!apiKey) {
      throw createError('Swiggy API key not configured', 500);
    }

    // Get order details
    const order = await databaseManager.get(
      'SELECT external_order_id FROM orders WHERE id = ? AND order_type = ?',
      [order_id, 'swiggy']
    );

    if (!order) {
      throw createError('Order not found', 404);
    }

    // Update status on Swiggy
    await axios.post(`https://api.swiggy.com/v1/orders/${order.external_order_id}/status`, {
      status: status
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Update local order status
    await databaseManager.run(
      'UPDATE orders SET status = ?, updated_at = ? WHERE id = ?',
      [status, new Date().toISOString(), order_id]
    );

    res.json({
      success: true,
      data: { order_id, status },
      message: 'Swiggy order status updated successfully'
    });

  } catch (error) {
    console.error('Update Swiggy order status error:', error);
    throw createError('Failed to update Swiggy order status', 500);
  }
};

// Paytm Integration
export const processPaytmPayment = async (req: Request, res: Response) => {
  try {
    const { order_id, amount, customer_phone, customer_email } = req.body;

    const merchantId = process.env.PAYTM_MERCHANT_ID;
    const merchantKey = process.env.PAYTM_MERCHANT_KEY;

    if (!merchantId || !merchantKey) {
      throw createError('Paytm credentials not configured', 500);
    }

    // Generate transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create Paytm payment request
    const paytmParams = {
      MID: merchantId,
      ORDER_ID: transactionId,
      CUST_ID: customer_phone || 'CUST001',
      TXN_AMOUNT: amount.toString(),
      CHANNEL_ID: 'WEB',
      WEBSITE: 'WEBSTAGING',
      CALLBACK_URL: `${process.env.BASE_URL}/api/integrations/paytm/callback`,
      INDUSTRY_TYPE_ID: 'Retail',
      CHECKSUMHASH: '' // Will be calculated
    };

    // Calculate checksum (simplified - in production use proper checksum calculation)
    const checksum = require('crypto').createHash('sha256')
      .update(Object.values(paytmParams).join('|') + merchantKey)
      .digest('hex');

    paytmParams.CHECKSUMHASH = checksum;

    // Store transaction details
    await databaseManager.run(`
      INSERT INTO payment_transactions (
        id, order_id, transaction_id, amount, payment_method, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      order_id,
      transactionId,
      amount,
      'paytm',
      'pending',
      new Date().toISOString()
    ]);

    res.json({
      success: true,
      data: {
        transaction_id: transactionId,
        payment_url: 'https://securegw-stage.paytm.in/order/process',
        params: paytmParams
      },
      message: 'Paytm payment initiated successfully'
    });

  } catch (error) {
    console.error('Process Paytm payment error:', error);
    throw createError('Failed to process Paytm payment', 500);
  }
};

export const paytmCallback = async (req: Request, res: Response) => {
  try {
    const { ORDERID, TXNID, TXNAMOUNT, STATUS, CHECKSUMHASH } = req.body;

    // Verify checksum
    const merchantKey = process.env.PAYTM_MERCHANT_KEY;
    const calculatedChecksum = require('crypto').createHash('sha256')
      .update(Object.values(req.body).join('|') + merchantKey)
      .digest('hex');

    if (calculatedChecksum !== CHECKSUMHASH) {
      throw createError('Invalid checksum', 400);
    }

    // Update transaction status
    await databaseManager.run(`
      UPDATE payment_transactions 
      SET status = ?, external_transaction_id = ?, updated_at = ?
      WHERE transaction_id = ?
    `, [
      STATUS === 'TXN_SUCCESS' ? 'completed' : 'failed',
      TXNID,
      new Date().toISOString(),
      ORDERID
    ]);

    // Update order payment status
    const transaction = await databaseManager.get(
      'SELECT order_id FROM payment_transactions WHERE transaction_id = ?',
      [ORDERID]
    );

    if (transaction) {
      await databaseManager.run(`
        UPDATE orders 
        SET payment_status = ?, updated_at = ?
        WHERE id = ?
      `, [
        STATUS === 'TXN_SUCCESS' ? 'completed' : 'failed',
        new Date().toISOString(),
        transaction.order_id
      ]);
    }

    res.json({
      success: true,
      data: {
        transaction_id: ORDERID,
        status: STATUS,
        message: STATUS === 'TXN_SUCCESS' ? 'Payment successful' : 'Payment failed'
      }
    });

  } catch (error) {
    console.error('Paytm callback error:', error);
    res.status(500).json({
      success: false,
      error: 'Callback processing failed'
    });
  }
};

// Webhook handlers
export const zomatoWebhook = async (req: Request, res: Response) => {
  try {
    const { order_id, status, items } = req.body;

    // Verify webhook signature (implement proper verification)
    // const signature = req.headers['x-zomato-signature'];
    // if (!verifySignature(req.body, signature)) {
    //   throw createError('Invalid webhook signature', 401);
    // }

    // Update order status
    await databaseManager.run(`
      UPDATE orders 
      SET status = ?, updated_at = ?
      WHERE external_order_id = ? AND order_type = ?
    `, [
      status,
      new Date().toISOString(),
      order_id,
      'zomato'
    ]);

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Zomato webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
};

export const swiggyWebhook = async (req: Request, res: Response) => {
  try {
    const { order_id, status, items } = req.body;

    // Verify webhook signature (implement proper verification)
    // const signature = req.headers['x-swiggy-signature'];
    // if (!verifySignature(req.body, signature)) {
    //   throw createError('Invalid webhook signature', 401);
    // }

    // Update order status
    await databaseManager.run(`
      UPDATE orders 
      SET status = ?, updated_at = ?
      WHERE external_order_id = ? AND order_type = ?
    `, [
      status,
      new Date().toISOString(),
      order_id,
      'swiggy'
    ]);

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Swiggy webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
};
