import { Request, Response } from 'express';
import databaseManager from '../database';
import { Product, CreateProductRequest, UpdateProductRequest } from '../types';
import { createError } from '../middleware/errorHandler';

// Get all products with categories
export const getAllProducts = async (req: Request, res: Response) => {
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
    
    const products = await databaseManager.all(query);
    
    res.json({
      success: true,
      data: products,
      message: 'Products retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    throw createError('Failed to fetch products', 500);
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
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
    
    const product = await databaseManager.get(query, [id]);
    
    if (!product) {
      throw createError('Product not found', 404);
    }
    
    res.json({
      success: true,
      data: product,
      message: 'Product retrieved successfully'
    });
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    console.error('Error fetching product:', error);
    throw createError('Failed to fetch product', 500);
  }
};

// Create new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData: CreateProductRequest = req.body;
    
    // Validate required fields
    if (!productData.name || !productData.category_id || !productData.price) {
      throw createError('Name, category_id, and price are required', 400);
    }

    const id = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const query = `
      INSERT INTO products (id, name, description, category_id, price, cost_price, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await databaseManager.run(query, [
      id,
      productData.name,
      productData.description || '',
      productData.category_id,
      productData.price,
      productData.cost_price || 0,
      productData.sort_order || 999
    ]);
    
    // Get the created product
    const newProduct = await databaseManager.get(`
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
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    console.error('Error creating product:', error);
    throw createError('Failed to create product', 500);
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateProductRequest = req.body;
    
    // Check if product exists
    const existingProduct = await databaseManager.get('SELECT id FROM products WHERE id = ?', [id]);
    if (!existingProduct) {
      throw createError('Product not found', 404);
    }

    const query = `
      UPDATE products 
      SET name = ?, description = ?, category_id = ?, price = ?, cost_price = ?, sort_order = ?
      WHERE id = ?
    `;
    
    await databaseManager.run(query, [
      updateData.name,
      updateData.description || '',
      updateData.category_id,
      updateData.price,
      updateData.cost_price || 0,
      updateData.sort_order || 999,
      id
    ]);
    
    // Get updated product
    const updatedProduct = await databaseManager.get(`
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
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    console.error('Error updating product:', error);
    throw createError('Failed to update product', 500);
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const existingProduct = await databaseManager.get('SELECT id FROM products WHERE id = ?', [id]);
    if (!existingProduct) {
      throw createError('Product not found', 404);
    }

    // Check if product is used in any orders
    const orderUsage = await databaseManager.get(
      'SELECT COUNT(*) as count FROM order_items WHERE product_id = ?',
      [id]
    );
    
    if (orderUsage.count > 0) {
      throw createError('Cannot delete product that has been used in orders', 400);
    }

    // Delete product recipes first
    await databaseManager.run('DELETE FROM product_recipes WHERE product_id = ?', [id]);
    
    // Delete product
    await databaseManager.run('DELETE FROM products WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    console.error('Error deleting product:', error);
    throw createError('Failed to delete product', 500);
  }
};

// Search products
export const searchProducts = async (req: Request, res: Response) => {
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
    
    const params: any[] = [];
    
    if (q) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }
    
    if (category_id) {
      query += ` AND p.category_id = ?`;
      params.push(category_id);
    }
    
    query += ` ORDER BY c.sort_order, p.sort_order`;
    
    const products = await databaseManager.all(query, params);
    
    res.json({
      success: true,
      data: products,
      message: 'Products search completed successfully'
    });
  } catch (error) {
    console.error('Error searching products:', error);
    throw createError('Failed to search products', 500);
  }
};

// Get categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const query = 'SELECT * FROM categories ORDER BY sort_order';
    const categories = await databaseManager.all(query);
    
    res.json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw createError('Failed to fetch categories', 500);
  }
};
