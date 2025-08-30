"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportDailySalesPDF = exports.getStockUsageReport = exports.getProfitAnalysis = exports.getMonthlyReport = exports.getDailySalesSummary = void 0;
const database_1 = __importDefault(require("../database"));
const errorHandler_1 = require("../middleware/errorHandler");
const pdfkit_1 = __importDefault(require("pdfkit"));
const stream_1 = require("stream");
const getDailySalesSummary = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        const dateStr = targetDate.toISOString().split('T')[0];
        const salesData = await database_1.default.all(`
      SELECT 
        o.id,
        o.order_number,
        o.customer_name,
        o.customer_phone,
        o.order_type,
        o.payment_method,
        o.payment_status,
        o.subtotal,
        o.discount_amount,
        o.discount_type,
        o.tax_amount,
        o.total_amount,
        o.status,
        o.created_at,
        oi.product_id,
        oi.product_name,
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        oi.notes
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE DATE(o.created_at) = ?
      ORDER BY o.created_at DESC
    `, [dateStr]);
        const summary = await database_1.default.get(`
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        COUNT(CASE WHEN o.payment_status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN o.payment_status = 'pending' THEN 1 END) as pending_orders,
        SUM(CASE WHEN o.payment_status = 'completed' THEN o.total_amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN o.payment_status = 'completed' THEN o.subtotal ELSE 0 END) as total_subtotal,
        SUM(CASE WHEN o.payment_status = 'completed' THEN o.discount_amount ELSE 0 END) as total_discounts,
        SUM(CASE WHEN o.payment_status = 'completed' THEN o.tax_amount ELSE 0 END) as total_tax,
        AVG(CASE WHEN o.payment_status = 'completed' THEN o.total_amount ELSE NULL END) as average_order_value
      FROM orders o
      WHERE DATE(o.created_at) = ?
    `, [dateStr]);
        const paymentBreakdown = await database_1.default.all(`
      SELECT 
        payment_method,
        COUNT(*) as order_count,
        SUM(total_amount) as total_amount
      FROM orders
      WHERE DATE(created_at) = ? AND payment_status = 'completed'
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `, [dateStr]);
        const orderTypeBreakdown = await database_1.default.all(`
      SELECT 
        order_type,
        COUNT(*) as order_count,
        SUM(total_amount) as total_amount
      FROM orders
      WHERE DATE(created_at) = ? AND payment_status = 'completed'
      GROUP BY order_type
      ORDER BY total_amount DESC
    `, [dateStr]);
        const topProducts = await database_1.default.all(`
      SELECT 
        oi.product_name,
        oi.product_id,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.created_at) = ? AND o.payment_status = 'completed'
      GROUP BY oi.product_id, oi.product_name
      ORDER BY total_quantity DESC
      LIMIT 10
    `, [dateStr]);
        res.json({
            success: true,
            data: {
                date: dateStr,
                summary,
                salesData,
                paymentBreakdown,
                orderTypeBreakdown,
                topProducts
            },
            message: 'Daily sales summary retrieved successfully'
        });
    }
    catch (error) {
        console.error('Get daily sales summary error:', error);
        throw (0, errorHandler_1.createError)('Failed to get daily sales summary', 500);
    }
};
exports.getDailySalesSummary = getDailySalesSummary;
const getMonthlyReport = async (req, res) => {
    try {
        const { year, month } = req.query;
        const targetYear = year ? Number(year) : new Date().getFullYear();
        const targetMonth = month ? Number(month) : new Date().getMonth() + 1;
        const monthlyData = await database_1.default.all(`
      SELECT 
        DATE(o.created_at) as date,
        COUNT(DISTINCT o.id) as total_orders,
        SUM(CASE WHEN o.payment_status = 'completed' THEN o.total_amount ELSE 0 END) as daily_revenue,
        SUM(CASE WHEN o.payment_status = 'completed' THEN o.subtotal ELSE 0 END) as daily_subtotal,
        SUM(CASE WHEN o.payment_status = 'completed' THEN o.discount_amount ELSE 0 END) as daily_discounts,
        SUM(CASE WHEN o.payment_status = 'completed' THEN o.tax_amount ELSE 0 END) as daily_tax
      FROM orders o
      WHERE strftime('%Y', o.created_at) = ? AND strftime('%m', o.created_at) = ?
      GROUP BY DATE(o.created_at)
      ORDER BY date ASC
    `, [targetYear.toString(), targetMonth.toString().padStart(2, '0')]);
        const monthlySummary = await database_1.default.get(`
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        COUNT(CASE WHEN o.payment_status = 'completed' THEN 1 END) as completed_orders,
        SUM(CASE WHEN o.payment_status = 'completed' THEN o.total_amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN o.payment_status = 'completed' THEN o.subtotal ELSE 0 END) as total_subtotal,
        SUM(CASE WHEN o.payment_status = 'completed' THEN o.discount_amount ELSE 0 END) as total_discounts,
        SUM(CASE WHEN o.payment_status = 'completed' THEN o.tax_amount ELSE 0 END) as total_tax,
        AVG(CASE WHEN o.payment_status = 'completed' THEN o.total_amount ELSE NULL END) as average_order_value
      FROM orders o
      WHERE strftime('%Y', o.created_at) = ? AND strftime('%m', o.created_at) = ?
    `, [targetYear.toString(), targetMonth.toString().padStart(2, '0')]);
        const categoryPerformance = await database_1.default.all(`
      SELECT 
        c.name as category_name,
        c.color as category_color,
        COUNT(DISTINCT o.id) as order_count,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE strftime('%Y', o.created_at) = ? 
        AND strftime('%m', o.created_at) = ? 
        AND o.payment_status = 'completed'
      GROUP BY c.id, c.name, c.color
      ORDER BY total_revenue DESC
    `, [targetYear.toString(), targetMonth.toString().padStart(2, '0')]);
        const topProducts = await database_1.default.all(`
      SELECT 
        oi.product_name,
        oi.product_id,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_revenue,
        AVG(oi.unit_price) as average_price
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE strftime('%Y', o.created_at) = ? 
        AND strftime('%m', o.created_at) = ? 
        AND o.payment_status = 'completed'
      GROUP BY oi.product_id, oi.product_name
      ORDER BY total_quantity DESC
      LIMIT 15
    `, [targetYear.toString(), targetMonth.toString().padStart(2, '0')]);
        res.json({
            success: true,
            data: {
                year: targetYear,
                month: targetMonth,
                monthlyData,
                monthlySummary,
                categoryPerformance,
                topProducts
            },
            message: 'Monthly report retrieved successfully'
        });
    }
    catch (error) {
        console.error('Get monthly report error:', error);
        throw (0, errorHandler_1.createError)('Failed to get monthly report', 500);
    }
};
exports.getMonthlyReport = getMonthlyReport;
const getProfitAnalysis = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        if (!start_date || !end_date) {
            throw (0, errorHandler_1.createError)('Start date and end date are required', 400);
        }
        const profitData = await database_1.default.all(`
      SELECT 
        o.id,
        o.order_number,
        o.total_amount as revenue,
        o.subtotal,
        o.discount_amount,
        o.tax_amount,
        o.created_at,
        SUM(oi.quantity * COALESCE(ii.unit_cost, 0)) as total_cost
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN inventory_items ii ON oi.product_id = ii.id
      WHERE DATE(o.created_at) BETWEEN ? AND ? 
        AND o.payment_status = 'completed'
      GROUP BY o.id, o.order_number, o.total_amount, o.subtotal, o.discount_amount, o.tax_amount, o.created_at
      ORDER BY o.created_at DESC
    `, [start_date, end_date]);
        const totalRevenue = profitData.reduce((sum, order) => sum + order.revenue, 0);
        const totalCost = profitData.reduce((sum, order) => sum + (order.total_cost || 0), 0);
        const totalProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
        const dailyProfit = await database_1.default.all(`
      SELECT 
        DATE(o.created_at) as date,
        SUM(o.total_amount) as daily_revenue,
        SUM(oi.quantity * COALESCE(ii.unit_cost, 0)) as daily_cost,
        SUM(o.total_amount) - SUM(oi.quantity * COALESCE(ii.unit_cost, 0)) as daily_profit
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN inventory_items ii ON oi.product_id = ii.id
      WHERE DATE(o.created_at) BETWEEN ? AND ? 
        AND o.payment_status = 'completed'
      GROUP BY DATE(o.created_at)
      ORDER BY date ASC
    `, [start_date, end_date]);
        const productProfit = await database_1.default.all(`
      SELECT 
        oi.product_name,
        oi.product_id,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_revenue,
        SUM(oi.quantity * COALESCE(ii.unit_cost, 0)) as total_cost,
        SUM(oi.total_price) - SUM(oi.quantity * COALESCE(ii.unit_cost, 0)) as total_profit,
        CASE 
          WHEN SUM(oi.total_price) > 0 
          THEN ((SUM(oi.total_price) - SUM(oi.quantity * COALESCE(ii.unit_cost, 0))) / SUM(oi.total_price)) * 100 
          ELSE 0 
        END as profit_margin
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      LEFT JOIN inventory_items ii ON oi.product_id = ii.id
      WHERE DATE(o.created_at) BETWEEN ? AND ? 
        AND o.payment_status = 'completed'
      GROUP BY oi.product_id, oi.product_name
      ORDER BY total_profit DESC
    `, [start_date, end_date]);
        res.json({
            success: true,
            data: {
                period: { start_date, end_date },
                summary: {
                    totalRevenue,
                    totalCost,
                    totalProfit,
                    profitMargin: Math.round(profitMargin * 100) / 100
                },
                dailyProfit,
                productProfit,
                profitData
            },
            message: 'Profit analysis retrieved successfully'
        });
    }
    catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }
        console.error('Get profit analysis error:', error);
        throw (0, errorHandler_1.createError)('Failed to get profit analysis', 500);
    }
};
exports.getProfitAnalysis = getProfitAnalysis;
const getStockUsageReport = async (req, res) => {
    try {
        const { start_date, end_date, category_id } = req.query;
        let whereClause = 'WHERE 1=1';
        const params = [];
        if (start_date && end_date) {
            whereClause += ' AND st.created_at BETWEEN ? AND ?';
            params.push(start_date, end_date);
        }
        if (category_id) {
            whereClause += ' AND i.category_id = ?';
            params.push(category_id);
        }
        const stockUsage = await database_1.default.all(`
      SELECT 
        i.id,
        i.name,
        i.category_id,
        c.name as category_name,
        c.color as category_color,
        i.current_stock,
        i.min_stock_level,
        i.max_stock_level,
        i.unit_cost,
        COALESCE(stock_in.total_in, 0) as total_stock_in,
        COALESCE(stock_out.total_out, 0) as total_stock_out,
        COALESCE(stock_in.total_cost_in, 0) as total_cost_in,
        COALESCE(stock_out.total_cost_out, 0) as total_cost_out,
        (COALESCE(stock_in.total_in, 0) - COALESCE(stock_out.total_out, 0)) as net_stock_change,
        CASE 
          WHEN COALESCE(stock_out.total_out, 0) > 0 
          THEN (COALESCE(stock_out.total_out, 0) / (COALESCE(stock_in.total_in, 0) + i.current_stock)) * 100 
          ELSE 0 
        END as usage_percentage
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN (
        SELECT 
          inventory_item_id,
          SUM(quantity) as total_in,
          SUM(total_cost) as total_cost_in
        FROM stock_transactions 
        WHERE transaction_type = 'stock_in'
        GROUP BY inventory_item_id
      ) stock_in ON i.id = stock_in.inventory_item_id
      LEFT JOIN (
        SELECT 
          inventory_item_id,
          SUM(quantity) as total_out,
          SUM(total_cost) as total_cost_out
        FROM stock_transactions 
        WHERE transaction_type = 'stock_out'
        GROUP BY inventory_item_id
      ) stock_out ON i.id = stock_out.inventory_item_id
      ${whereClause}
      ORDER BY total_stock_out DESC
    `, params);
        const dailyStockMovement = await database_1.default.all(`
      SELECT 
        DATE(st.created_at) as date,
        st.transaction_type,
        SUM(st.quantity) as total_quantity,
        SUM(st.total_cost) as total_cost,
        COUNT(*) as transaction_count
      FROM stock_transactions st
      JOIN inventory_items i ON st.inventory_item_id = i.id
      ${whereClause}
      GROUP BY DATE(st.created_at), st.transaction_type
      ORDER BY date DESC, st.transaction_type
    `, params);
        const categoryStockUsage = await database_1.default.all(`
      SELECT 
        c.id,
        c.name as category_name,
        c.color as category_color,
        COUNT(i.id) as total_items,
        SUM(i.current_stock) as total_current_stock,
        SUM(COALESCE(stock_out.total_out, 0)) as total_usage,
        SUM(COALESCE(stock_out.total_cost_out, 0)) as total_usage_cost
      FROM categories c
      LEFT JOIN inventory_items i ON c.id = i.category_id
      LEFT JOIN (
        SELECT 
          inventory_item_id,
          SUM(quantity) as total_out,
          SUM(total_cost) as total_cost_out
        FROM stock_transactions 
        WHERE transaction_type = 'stock_out'
        GROUP BY inventory_item_id
      ) stock_out ON i.id = stock_out.inventory_item_id
      ${whereClause.replace('WHERE 1=1', 'WHERE c.id IS NOT NULL')}
      GROUP BY c.id, c.name, c.color
      ORDER BY total_usage DESC
    `, params);
        res.json({
            success: true,
            data: {
                stockUsage,
                dailyStockMovement,
                categoryStockUsage,
                filters: { start_date, end_date, category_id }
            },
            message: 'Stock usage report retrieved successfully'
        });
    }
    catch (error) {
        console.error('Get stock usage report error:', error);
        throw (0, errorHandler_1.createError)('Failed to get stock usage report', 500);
    }
};
exports.getStockUsageReport = getStockUsageReport;
const exportDailySalesPDF = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        const dateStr = targetDate.toISOString().split('T')[0];
        const salesData = await database_1.default.all(`
      SELECT 
        o.id,
        o.order_number,
        o.customer_name,
        o.order_type,
        o.payment_method,
        o.total_amount,
        o.status,
        o.created_at
      FROM orders o
      WHERE DATE(o.created_at) = ?
      ORDER BY o.created_at DESC
    `, [dateStr]);
        const summary = await database_1.default.get(`
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        SUM(CASE WHEN o.payment_status = 'completed' THEN o.total_amount ELSE 0 END) as total_revenue,
        AVG(CASE WHEN o.payment_status = 'completed' THEN o.total_amount ELSE NULL END) as average_order_value
      FROM orders o
      WHERE DATE(o.created_at) = ?
    `, [dateStr]);
        const doc = new pdfkit_1.default();
        const stream = new stream_1.Readable().wrap(doc);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="daily-sales-${dateStr}.pdf"`);
        doc.pipe(res);
        doc.fontSize(20).text('Smoocho - Daily Sales Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Date: ${targetDate.toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);
        doc.fontSize(16).text('Summary', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Total Orders: ${summary.total_orders}`);
        doc.text(`Total Revenue: ₹${summary.total_revenue?.toFixed(2) || '0.00'}`);
        doc.text(`Average Order Value: ₹${summary.average_order_value?.toFixed(2) || '0.00'}`);
        doc.moveDown(2);
        doc.fontSize(16).text('Sales Details', { underline: true });
        doc.moveDown();
        salesData.forEach((order, index) => {
            doc.fontSize(10).text(`${index + 1}. Order #${order.order_number} - ${order.customer_name || 'Walk-in'}`);
            doc.fontSize(8).text(`   Type: ${order.order_type} | Payment: ${order.payment_method} | Amount: ₹${order.total_amount}`);
            doc.moveDown(0.5);
        });
        doc.end();
    }
    catch (error) {
        console.error('Export daily sales PDF error:', error);
        throw (0, errorHandler_1.createError)('Failed to export daily sales PDF', 500);
    }
};
exports.exportDailySalesPDF = exportDailySalesPDF;
//# sourceMappingURL=reportsController.js.map