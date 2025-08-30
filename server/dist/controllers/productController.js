"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.searchProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const database_1 = __importDefault(require("../database"));
const errorHandler_1 = require("../middleware/errorHandler");
const getAllProducts = async (req, res) => {
    try {
        const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.color as category_color
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY c.sort_order, p.sort_order
    `;
        const products = await database_1.default.all(query);
        res.json({
            success: true,
            data: products,
            message: 'Products retrieved successfully'
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        throw (0, errorHandler_1.createError)('Failed to fetch products', 500);
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.color as category_color
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
        const product = await database_1.default.get(query, [id]);
        if (!product) {
            throw (0, errorHandler_1.createError)('Product not found', 404);
        }
        res.json({
            success: true,
            data: product,
            message: 'Product retrieved successfully'
        });
    }
    catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }
        console.error('Error fetching product:', error);
        throw (0, errorHandler_1.createError)('Failed to fetch product', 500);
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const productData = req.body;
        if (!productData.name || !productData.category_id || !productData.price) {
            throw (0, errorHandler_1.createError)('Name, category_id, and price are required', 400);
        }
        const id = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const query = `
      INSERT INTO products (id, name, description, category_id, price, cost_price, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
        await database_1.default.run(query, [
            id,
            productData.name,
            productData.description || '',
            productData.category_id,
            productData.price,
            productData.cost_price || 0,
            productData.sort_order || 999
        ]);
        const newProduct = await database_1.default.get(`
      SELECT 
        p.*,
        c.name as category_name,
        c.color as category_color
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
        res.status(201).json({
            success: true,
            data: newProduct,
            message: 'Product created successfully'
        });
    }
    catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }
        console.error('Error creating product:', error);
        throw (0, errorHandler_1.createError)('Failed to create product', 500);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const existingProduct = await database_1.default.get('SELECT id FROM products WHERE id = ?', [id]);
        if (!existingProduct) {
            throw (0, errorHandler_1.createError)('Product not found', 404);
        }
        const query = `
      UPDATE products 
      SET name = ?, description = ?, category_id = ?, price = ?, cost_price = ?, sort_order = ?
      WHERE id = ?
    `;
        await database_1.default.run(query, [
            updateData.name,
            updateData.description || '',
            updateData.category_id,
            updateData.price,
            updateData.cost_price || 0,
            updateData.sort_order || 999,
            id
        ]);
        const updatedProduct = await database_1.default.get(`
      SELECT 
        p.*,
        c.name as category_name,
        c.color as category_color
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
        res.json({
            success: true,
            data: updatedProduct,
            message: 'Product updated successfully'
        });
    }
    catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }
        console.error('Error updating product:', error);
        throw (0, errorHandler_1.createError)('Failed to update product', 500);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const existingProduct = await database_1.default.get('SELECT id FROM products WHERE id = ?', [id]);
        if (!existingProduct) {
            throw (0, errorHandler_1.createError)('Product not found', 404);
        }
        const orderUsage = await database_1.default.get('SELECT COUNT(*) as count FROM order_items WHERE product_id = ?', [id]);
        if (orderUsage.count > 0) {
            throw (0, errorHandler_1.createError)('Cannot delete product that has been used in orders', 400);
        }
        await database_1.default.run('DELETE FROM product_recipes WHERE product_id = ?', [id]);
        await database_1.default.run('DELETE FROM products WHERE id = ?', [id]);
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    }
    catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }
        console.error('Error deleting product:', error);
        throw (0, errorHandler_1.createError)('Failed to delete product', 500);
    }
};
exports.deleteProduct = deleteProduct;
const searchProducts = async (req, res) => {
    try {
        const { q, category_id } = req.query;
        let query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.color as category_color
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
        const params = [];
        if (q) {
            query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`);
        }
        if (category_id) {
            query += ` AND p.category_id = ?`;
            params.push(category_id);
        }
        query += ` ORDER BY c.sort_order, p.sort_order`;
        const products = await database_1.default.all(query, params);
        res.json({
            success: true,
            data: products,
            message: 'Products search completed successfully'
        });
    }
    catch (error) {
        console.error('Error searching products:', error);
        throw (0, errorHandler_1.createError)('Failed to search products', 500);
    }
};
exports.searchProducts = searchProducts;
const getCategories = async (req, res) => {
    try {
        const query = 'SELECT * FROM categories ORDER BY sort_order';
        const categories = await database_1.default.all(query);
        res.json({
            success: true,
            data: categories,
            message: 'Categories retrieved successfully'
        });
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        throw (0, errorHandler_1.createError)('Failed to fetch categories', 500);
    }
};
exports.getCategories = getCategories;
//# sourceMappingURL=productController.js.map