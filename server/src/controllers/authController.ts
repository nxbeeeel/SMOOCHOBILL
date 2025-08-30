import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import databaseManager from '../database';
import { LoginRequest, LoginResponse, User } from '../types';
import { createError } from '../middleware/errorHandler';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password }: LoginRequest = req.body;

    // Validate input
    if (!username || !password) {
      throw createError('Username and password are required', 400);
    }

    // Get user from database
    const user = await databaseManager.get(
      'SELECT * FROM users WHERE username = ? AND is_active = 1',
      [username]
    );

    if (!user) {
      throw createError('Invalid username or password', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw createError('Invalid username or password', 401);
    }

    // Update last login
    await databaseManager.run(
      'UPDATE users SET last_login = datetime("now") WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw createError('JWT_SECRET not configured', 500);
    }

    const token = jwt.sign(
      { 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      },
      secret,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
      } as any
    );

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    const response: LoginResponse = {
      user: userWithoutPassword,
      token,
      expires_in: 24 * 60 * 60 // 24 hours in seconds
    };

    res.json({
      success: true,
      data: response,
      message: 'Login successful'
    });

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    console.error('Login error:', error);
    throw createError('Login failed', 500);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const user = await databaseManager.get(
      'SELECT id, username, email, role, created_at, last_login, is_active FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully'
    });

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    console.error('Get profile error:', error);
    throw createError('Failed to get profile', 500);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const { email } = req.body;

    // Validate email
    if (email && !isValidEmail(email)) {
      throw createError('Invalid email format', 400);
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await databaseManager.get(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.user.id]
      );

      if (existingUser) {
        throw createError('Email already in use', 400);
      }
    }

    // Update user profile
    const updateFields = [];
    const params = [];

    if (email) {
      updateFields.push('email = ?');
      params.push(email);
    }

    if (updateFields.length === 0) {
      throw createError('No fields to update', 400);
    }

    updateFields.push('updated_at = datetime("now")');
    params.push(req.user.id);

    await databaseManager.run(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    // Get updated user
    const updatedUser = await databaseManager.get(
      'SELECT id, username, email, role, created_at, last_login, is_active FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    console.error('Update profile error:', error);
    throw createError('Failed to update profile', 500);
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      throw createError('Current password and new password are required', 400);
    }

    if (newPassword.length < 6) {
      throw createError('New password must be at least 6 characters long', 400);
    }

    // Get current user with password
    const user = await databaseManager.get(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      throw createError('User not found', 404);
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw createError('Current password is incorrect', 401);
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await databaseManager.run(
      'UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?',
      [newPasswordHash, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    console.error('Change password error:', error);
    throw createError('Failed to change password', 500);
  }
};

// Helper function to validate email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
