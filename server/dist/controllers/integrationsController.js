"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swiggyWebhook = exports.zomatoWebhook = exports.paytmCallback = exports.processPaytmPayment = exports.updateSwiggyOrderStatus = exports.syncSwiggyOrders = exports.updateZomatoOrderStatus = exports.syncZomatoOrders = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../database"));
const errorHandler_1 = require("../middleware/errorHandler");
const axios_1 = __importDefault(require("axios"));
const syncZomatoOrders = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const apiKey = process.env.ZOMATO_API_KEY;
        if (!apiKey) {
            throw (0, errorHandler_1.createError)('Zomato API key not configured', 500);
        }
        const response = await axios_1.default.get('https://developers.zomato.com/api/v2.1/orders', {
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
        const syncedOrders = [];
        for (const zomatoOrder of zomatoOrders) {
            const existingOrder = await database_1.default.get('SELECT id FROM orders WHERE external_order_id = ? AND order_type = ?', [zomatoOrder.order_id, 'zomato']);
            if (!existingOrder) {
                const orderId = (0, uuid_1.v4)();
                const now = new Date().toISOString();
                await database_1.default.run(`
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
                if (zomatoOrder.items) {
                    for (const item of zomatoOrder.items) {
                        await database_1.default.run(`
              INSERT INTO order_items (
                id, order_id, product_id, product_name, quantity, unit_price, total_price, notes
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                            (0, uuid_1.v4)(),
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
    }
    catch (error) {
        console.error('Sync Zomato orders error:', error);
        throw (0, errorHandler_1.createError)('Failed to sync Zomato orders', 500);
    }
};
exports.syncZomatoOrders = syncZomatoOrders;
const updateZomatoOrderStatus = async (req, res) => {
    try {
        const { order_id } = req.params;
        const { status } = req.body;
        const apiKey = process.env.ZOMATO_API_KEY;
        if (!apiKey) {
            throw (0, errorHandler_1.createError)('Zomato API key not configured', 500);
        }
        const order = await database_1.default.get('SELECT external_order_id FROM orders WHERE id = ? AND order_type = ?', [order_id, 'zomato']);
        if (!order) {
            throw (0, errorHandler_1.createError)('Order not found', 404);
        }
        await axios_1.default.post(`https://developers.zomato.com/api/v2.1/orders/${order.external_order_id}/status`, {
            status: status
        }, {
            headers: {
                'user-key': apiKey,
                'Content-Type': 'application/json'
            }
        });
        await database_1.default.run('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', [status, new Date().toISOString(), order_id]);
        res.json({
            success: true,
            data: { order_id, status },
            message: 'Zomato order status updated successfully'
        });
    }
    catch (error) {
        console.error('Update Zomato order status error:', error);
        throw (0, errorHandler_1.createError)('Failed to update Zomato order status', 500);
    }
};
exports.updateZomatoOrderStatus = updateZomatoOrderStatus;
const syncSwiggyOrders = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const apiKey = process.env.SWIGGY_API_KEY;
        if (!apiKey) {
            throw (0, errorHandler_1.createError)('Swiggy API key not configured', 500);
        }
        const response = await axios_1.default.get('https://api.swiggy.com/v1/orders', {
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
        const syncedOrders = [];
        for (const swiggyOrder of swiggyOrders) {
            const existingOrder = await database_1.default.get('SELECT id FROM orders WHERE external_order_id = ? AND order_type = ?', [swiggyOrder.order_id, 'swiggy']);
            if (!existingOrder) {
                const orderId = (0, uuid_1.v4)();
                const now = new Date().toISOString();
                await database_1.default.run(`
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
                if (swiggyOrder.items) {
                    for (const item of swiggyOrder.items) {
                        await database_1.default.run(`
              INSERT INTO order_items (
                id, order_id, product_id, product_name, quantity, unit_price, total_price, notes
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                            (0, uuid_1.v4)(),
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
    }
    catch (error) {
        console.error('Sync Swiggy orders error:', error);
        throw (0, errorHandler_1.createError)('Failed to sync Swiggy orders', 500);
    }
};
exports.syncSwiggyOrders = syncSwiggyOrders;
const updateSwiggyOrderStatus = async (req, res) => {
    try {
        const { order_id } = req.params;
        const { status } = req.body;
        const apiKey = process.env.SWIGGY_API_KEY;
        if (!apiKey) {
            throw (0, errorHandler_1.createError)('Swiggy API key not configured', 500);
        }
        const order = await database_1.default.get('SELECT external_order_id FROM orders WHERE id = ? AND order_type = ?', [order_id, 'swiggy']);
        if (!order) {
            throw (0, errorHandler_1.createError)('Order not found', 404);
        }
        await axios_1.default.post(`https://api.swiggy.com/v1/orders/${order.external_order_id}/status`, {
            status: status
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        await database_1.default.run('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', [status, new Date().toISOString(), order_id]);
        res.json({
            success: true,
            data: { order_id, status },
            message: 'Swiggy order status updated successfully'
        });
    }
    catch (error) {
        console.error('Update Swiggy order status error:', error);
        throw (0, errorHandler_1.createError)('Failed to update Swiggy order status', 500);
    }
};
exports.updateSwiggyOrderStatus = updateSwiggyOrderStatus;
const processPaytmPayment = async (req, res) => {
    try {
        const { order_id, amount, customer_phone, customer_email } = req.body;
        const merchantId = process.env.PAYTM_MERCHANT_ID;
        const merchantKey = process.env.PAYTM_MERCHANT_KEY;
        if (!merchantId || !merchantKey) {
            throw (0, errorHandler_1.createError)('Paytm credentials not configured', 500);
        }
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const paytmParams = {
            MID: merchantId,
            ORDER_ID: transactionId,
            CUST_ID: customer_phone || 'CUST001',
            TXN_AMOUNT: amount.toString(),
            CHANNEL_ID: 'WEB',
            WEBSITE: 'WEBSTAGING',
            CALLBACK_URL: `${process.env.BASE_URL}/api/integrations/paytm/callback`,
            INDUSTRY_TYPE_ID: 'Retail',
            CHECKSUMHASH: ''
        };
        const checksum = require('crypto').createHash('sha256')
            .update(Object.values(paytmParams).join('|') + merchantKey)
            .digest('hex');
        paytmParams.CHECKSUMHASH = checksum;
        await database_1.default.run(`
      INSERT INTO payment_transactions (
        id, order_id, transaction_id, amount, payment_method, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
            (0, uuid_1.v4)(),
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
    }
    catch (error) {
        console.error('Process Paytm payment error:', error);
        throw (0, errorHandler_1.createError)('Failed to process Paytm payment', 500);
    }
};
exports.processPaytmPayment = processPaytmPayment;
const paytmCallback = async (req, res) => {
    try {
        const { ORDERID, TXNID, TXNAMOUNT, STATUS, CHECKSUMHASH } = req.body;
        const merchantKey = process.env.PAYTM_MERCHANT_KEY;
        const calculatedChecksum = require('crypto').createHash('sha256')
            .update(Object.values(req.body).join('|') + merchantKey)
            .digest('hex');
        if (calculatedChecksum !== CHECKSUMHASH) {
            throw (0, errorHandler_1.createError)('Invalid checksum', 400);
        }
        await database_1.default.run(`
      UPDATE payment_transactions 
      SET status = ?, external_transaction_id = ?, updated_at = ?
      WHERE transaction_id = ?
    `, [
            STATUS === 'TXN_SUCCESS' ? 'completed' : 'failed',
            TXNID,
            new Date().toISOString(),
            ORDERID
        ]);
        const transaction = await database_1.default.get('SELECT order_id FROM payment_transactions WHERE transaction_id = ?', [ORDERID]);
        if (transaction) {
            await database_1.default.run(`
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
    }
    catch (error) {
        console.error('Paytm callback error:', error);
        res.status(500).json({
            success: false,
            error: 'Callback processing failed'
        });
    }
};
exports.paytmCallback = paytmCallback;
const zomatoWebhook = async (req, res) => {
    try {
        const { order_id, status, items } = req.body;
        await database_1.default.run(`
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
    }
    catch (error) {
        console.error('Zomato webhook error:', error);
        res.status(500).json({
            success: false,
            error: 'Webhook processing failed'
        });
    }
};
exports.zomatoWebhook = zomatoWebhook;
const swiggyWebhook = async (req, res) => {
    try {
        const { order_id, status, items } = req.body;
        await database_1.default.run(`
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
    }
    catch (error) {
        console.error('Swiggy webhook error:', error);
        res.status(500).json({
            success: false,
            error: 'Webhook processing failed'
        });
    }
};
exports.swiggyWebhook = swiggyWebhook;
//# sourceMappingURL=integrationsController.js.map