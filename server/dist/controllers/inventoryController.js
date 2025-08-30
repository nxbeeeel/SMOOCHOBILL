"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryReport = exports.getExpiryAlerts = exports.getLowStockAlerts = exports.getStockTransactions = exports.deductStock = exports.addStock = exports.updateInventoryItem = exports.createInventoryItem = exports.getInventoryItemById = exports.getAllInventoryItems = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../database"));
const errorHandler_1 = require("../middleware/errorHandler");
const getAllInventoryItems = async (req, res) => {
    try {
        const items = await database_1.default.all(`
      SELECT
        i.*,
        c.name as category_name,
        c.color as category_color
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      ORDER BY i.name ASC
    `);
        res.json({
            success: true,
            data: items,
            message: 'Inventory items retrieved successfully'
        });
    }
    catch (error) {
        console.error('Get inventory items error:', error);
        throw (0, errorHandler_1.createError)('Failed to get inventory items', 500);
    }
};
exports.getAllInventoryItems = getAllInventoryItems;
const getInventoryItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await database_1.default.get(`
      SELECT
        i.*,
        c.name as category_name,
        c.color as category_color
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ?
    `, [id]);
        if (!item) {
            throw (0, errorHandler_1.createError)('Inventory item not found', 404);
        }
        const transactions = await database_1.default.all(`
      SELECT * FROM stock_transactions
      WHERE inventory_item_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [id]);
        res.json({
            success: true,
            data: { ...item, transactions },
            message: 'Inventory item retrieved successfully'
        });
    }
    catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }
        console.error('Get inventory item error:', error);
        throw (0, errorHandler_1.createError)('Failed to get inventory item', 500);
    }
};
exports.getInventoryItemById = getInventoryItemById;
const createInventoryItem = async (req, res) => {
    try {
        const { name, description, category_id, current_stock, min_stock_level, max_stock_level, unit_cost, unit_price, supplier_info, expiry_date } = req.body;
        if (!name || !category_id || current_stock === undefined || unit_cost === undefined) {
            throw (0, errorHandler_1.createError)('Name, category, current stock, and unit cost are required', 400);
        }
        const existingItem = await database_1.default.get('SELECT id FROM inventory_items WHERE name = ?', [name]);
        if (existingItem) {
            throw (0, errorHandler_1.createError)('Inventory item with this name already exists', 400);
        }
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        await database_1.default.run(`
      INSERT INTO inventory_items (
        id, name, description, category_id, current_stock, min_stock_level,
        max_stock_level, unit_cost, unit_price, supplier_info, expiry_date,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            id, name, description, category_id, current_stock, min_stock_level,
            max_stock_level, unit_cost, unit_price, supplier_info, expiry_date,
            now, now
        ]);
        if (current_stock > 0) {
            await database_1.default.run(`
        INSERT INTO stock_transactions (
          id, inventory_item_id, transaction_type, quantity,
          unit_cost, total_cost, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                (0, uuid_1.v4)(), id, 'initial_stock', current_stock,
                unit_cost, current_stock * unit_cost, 'Initial stock entry', now
            ]);
        }
        const createdItem = await database_1.default.get(`
      SELECT
        i.*,
        c.name as category_name,
        c.color as category_color
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ?
    `, [id]);
        res.status(201).json({
            success: true,
            data: createdItem,
            message: 'Inventory item created successfully'
        });
    }
    catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }
        console.error('Create inventory item error:', error);
        throw (0, errorHandler_1.createError)('Failed to create inventory item', 500);
    }
};
exports.createInventoryItem = createInventoryItem;
const updateInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const existingItem = await database_1.default.get('SELECT * FROM inventory_items WHERE id = ?', [id]);
        if (!existingItem) {
            throw (0, errorHandler_1.createError)('Inventory item not found', 404);
        }
        const updateFields = [];
        const params = [];
        if (updateData.name !== undefined) {
            updateFields.push('name = ?');
            params.push(updateData.name);
        }
        if (updateData.description !== undefined) {
            updateFields.push('description = ?');
            params.push(updateData.description);
        }
        if (updateData.category_id !== undefined) {
            updateFields.push('category_id = ?');
            params.push(updateData.category_id);
        }
        if (updateData.min_stock_level !== undefined) {
            updateFields.push('min_stock_level = ?');
            params.push(updateData.min_stock_level);
        }
        if (updateData.max_stock_level !== undefined) {
            updateFields.push('max_stock_level = ?');
            params.push(updateData.max_stock_level);
        }
        if (updateData.unit_cost !== undefined) {
            updateFields.push('unit_cost = ?');
            params.push(updateData.unit_cost);
        }
        if (updateData.unit_price !== undefined) {
            updateFields.push('unit_price = ?');
            params.push(updateData.unit_price);
        }
        if (updateData.supplier_info !== undefined) {
            updateFields.push('supplier_info = ?');
            params.push(updateData.supplier_info);
        }
        if (updateData.expiry_date !== undefined) {
            updateFields.push('expiry_date = ?');
            params.push(updateData.expiry_date);
        }
        if (updateFields.length === 0) {
            throw (0, errorHandler_1.createError)('No fields to update', 400);
        }
        updateFields.push('updated_at = ?');
        params.push(new Date().toISOString());
        params.push(id);
        await database_1.default.run(`UPDATE inventory_items SET ${updateFields.join(', ')} WHERE id = ?`, params);
        const updatedItem = await database_1.default.get(`
      SELECT
        i.*,
        c.name as category_name,
        c.color as category_color
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ?
    `, [id]);
        res.json({
            success: true,
            data: updatedItem,
            message: 'Inventory item updated successfully'
        });
    }
    catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }
        console.error('Update inventory item error:', error);
        throw (0, errorHandler_1.createError)('Failed to update inventory item', 500);
    }
};
exports.updateInventoryItem = updateInventoryItem;
const addStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, unit_cost, notes } = req.body;
        if (!quantity || quantity <= 0) {
            throw (0, errorHandler_1.createError)('Valid quantity is required', 400);
        }
        const item = await database_1.default.get('SELECT * FROM inventory_items WHERE id = ?', [id]);
        if (!item) {
            throw (0, errorHandler_1.createError)('Inventory item not found', 404);
        }
        const cost = unit_cost || item.unit_cost;
        const totalCost = quantity * cost;
        const newStock = item.current_stock + quantity;
        const now = new Date().toISOString();
        await database_1.default.run('UPDATE inventory_items SET current_stock = ?, updated_at = ? WHERE id = ?', [newStock, now, id]);
        await database_1.default.run(`
      INSERT INTO stock_transactions (
        id, inventory_item_id, transaction_type, quantity,
        unit_cost, total_cost, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            (0, uuid_1.v4)(), id, 'stock_in', quantity,
            cost, totalCost, notes || 'Manual stock addition', now
        ]);
        const updatedItem = await database_1.default.get(`
      SELECT
        i.*,
        c.name as category_name,
        c.color as category_color
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ?
    `, [id]);
        res.json({
            success: true,
            data: updatedItem,
            message: 'Stock added successfully'
        });
    }
    catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }
        console.error('Add stock error:', error);
        throw (0, errorHandler_1.createError)('Failed to add stock', 500);
    }
};
exports.addStock = addStock;
const deductStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, reason } = req.body;
        if (!quantity || quantity <= 0) {
            throw (0, errorHandler_1.createError)('Valid quantity is required', 400);
        }
        const item = await database_1.default.get('SELECT * FROM inventory_items WHERE id = ?', [id]);
        if (!item) {
            throw (0, errorHandler_1.createError)('Inventory item not found', 404);
        }
        if (item.current_stock < quantity) {
            throw (0, errorHandler_1.createError)('Insufficient stock', 400);
        }
        const newStock = item.current_stock - quantity;
        const now = new Date().toISOString();
        await database_1.default.run('UPDATE inventory_items SET current_stock = ?, updated_at = ? WHERE id = ?', [newStock, now, id]);
        await database_1.default.run(`
      INSERT INTO stock_transactions (
        id, inventory_item_id, transaction_type, quantity,
        unit_cost, total_cost, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            (0, uuid_1.v4)(), id, 'stock_out', quantity,
            item.unit_cost, quantity * item.unit_cost, reason || 'Manual stock deduction', now
        ]);
        const updatedItem = await database_1.default.get(`
      SELECT
        i.*,
        c.name as category_name,
        c.color as category_color
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ?
    `, [id]);
        res.json({
            success: true,
            data: updatedItem,
            message: 'Stock deducted successfully'
        });
    }
    catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }
        console.error('Deduct stock error:', error);
        throw (0, errorHandler_1.createError)('Failed to deduct stock', 500);
    }
};
exports.deductStock = deductStock;
const getStockTransactions = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20, type } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const whereClause = type ? 'AND transaction_type = ?' : '';
        const params = type ? [id, type] : [id];
        const transactions = await database_1.default.all(`
      SELECT
        st.*,
        ii.name as item_name
      FROM stock_transactions st
      JOIN inventory_items ii ON st.inventory_item_id = ii.id
      WHERE st.inventory_item_id = ? ${whereClause}
      ORDER BY st.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, Number(limit), offset]);
        const total = await database_1.default.get(`
      SELECT COUNT(*) as count
      FROM stock_transactions st
      WHERE st.inventory_item_id = ? ${whereClause}
    `, params);
        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: total.count,
                    pages: Math.ceil(total.count / Number(limit))
                }
            },
            message: 'Stock transactions retrieved successfully'
        });
    }
    catch (error) {
        console.error('Get stock transactions error:', error);
        throw (0, errorHandler_1.createError)('Failed to get stock transactions', 500);
    }
};
exports.getStockTransactions = getStockTransactions;
const getLowStockAlerts = async (req, res) => {
    try {
        const alerts = await database_1.default.all(`
      SELECT
        i.*,
        c.name as category_name,
        c.color as category_color,
        (i.min_stock_level - i.current_stock) as stock_needed
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.current_stock <= i.min_stock_level
      ORDER BY (i.min_stock_level - i.current_stock) DESC
    `);
        res.json({
            success: true,
            data: alerts,
            message: 'Low stock alerts retrieved successfully'
        });
    }
    catch (error) {
        console.error('Get low stock alerts error:', error);
        throw (0, errorHandler_1.createError)('Failed to get low stock alerts', 500);
    }
};
exports.getLowStockAlerts = getLowStockAlerts;
const getExpiryAlerts = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + Number(days));
        const alerts = await database_1.default.all(`
      SELECT
        i.*,
        c.name as category_name,
        c.color as category_color,
        julianday(i.expiry_date) - julianday('now') as days_until_expiry
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.expiry_date IS NOT NULL
        AND i.expiry_date <= ?
        AND i.current_stock > 0
      ORDER BY i.expiry_date ASC
    `, [expiryDate.toISOString().split('T')[0]]);
        res.json({
            success: true,
            data: alerts,
            message: 'Expiry alerts retrieved successfully'
        });
    }
    catch (error) {
        console.error('Get expiry alerts error:', error);
        throw (0, errorHandler_1.createError)('Failed to get expiry alerts', 500);
    }
};
exports.getExpiryAlerts = getExpiryAlerts;
const getInventoryReport = async (req, res) => {
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
        const report = await database_1.default.all(`
      SELECT
        i.id,
        i.name,
        i.category_id,
        c.name as category_name,
        i.current_stock,
        i.min_stock_level,
        i.max_stock_level,
        i.unit_cost,
        i.unit_price,
        COALESCE(stock_in.total_in, 0) as total_stock_in,
        COALESCE(stock_out.total_out, 0) as total_stock_out,
        COALESCE(stock_in.total_cost_in, 0) as total_cost_in,
        COALESCE(stock_out.total_cost_out, 0) as total_cost_out
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
          stock_out.inventory_item_id,
          SUM(stock_out.quantity) as total_out,
          SUM(stock_out.total_cost) as total_cost_out
        FROM stock_transactions stock_out
        WHERE stock_out.transaction_type = 'stock_out'
        GROUP BY stock_out.inventory_item_id
      ) stock_out ON i.id = stock_out.inventory_item_id
      ${whereClause}
      ORDER BY i.name ASC
    `, params);
        const totals = report.reduce((acc, item) => {
            acc.total_items += 1;
            acc.total_stock_value += item.current_stock * item.unit_cost;
            acc.total_stock_in += item.total_stock_in;
            acc.total_stock_out += item.total_stock_out;
            acc.total_cost_in += item.total_cost_in;
            acc.total_cost_out += item.total_cost_out;
            return acc;
        }, {
            total_items: 0,
            total_stock_value: 0,
            total_stock_in: 0,
            total_stock_out: 0,
            total_cost_in: 0,
            total_cost_out: 0
        });
        res.json({
            success: true,
            data: {
                items: report,
                totals,
                filters: { start_date, end_date, category_id }
            },
            message: 'Inventory report generated successfully'
        });
    }
    catch (error) {
        console.error('Get inventory report error:', error);
        throw (0, errorHandler_1.createError)('Failed to generate inventory report', 500);
    }
};
exports.getInventoryReport = getInventoryReport;
//# sourceMappingURL=inventoryController.js.map