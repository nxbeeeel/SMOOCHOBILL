import { Request, Response } from 'express';
import databaseManager from '../database';
import { createError } from '../middleware/errorHandler';
import nodemailer from 'nodemailer';
import axios from 'axios';

// Email configuration
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// WhatsApp API configuration
const sendWhatsAppMessage = async (phoneNumber: string, message: string) => {
  const apiKey = process.env.WHATSAPP_API_KEY;
  const apiUrl = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/v1/messages';

  if (!apiKey) {
    throw new Error('WhatsApp API key not configured');
  }

  try {
    const response = await axios.post(apiUrl, {
      to: phoneNumber,
      type: 'text',
      text: { body: message }
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('WhatsApp API error:', error);
    throw new Error('Failed to send WhatsApp message');
  }
};

// Send email alert
export const sendEmailAlert = async (req: Request, res: Response) => {
  try {
    const { to, subject, message, html } = req.body;

    if (!to || !subject || !message) {
      throw createError('To, subject, and message are required', 400);
    }

    const transporter = createEmailTransporter();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: to,
      subject: subject,
      text: message,
      html: html || message
    };

    const info = await transporter.sendMail(mailOptions);

    // Log the alert
    await databaseManager.run(`
      INSERT INTO alert_logs (
        id, alert_type, recipient, subject, message, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      require('uuid').v4(),
      'email',
      to,
      subject,
      message,
      'sent',
      new Date().toISOString()
    ]);

    res.json({
      success: true,
      data: { messageId: info.messageId },
      message: 'Email alert sent successfully'
    });

  } catch (error) {
    console.error('Send email alert error:', error);
    
    // Log failed alert
    try {
      await databaseManager.run(`
        INSERT INTO alert_logs (
          id, alert_type, recipient, subject, message, status, error_message, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        require('uuid').v4(),
        'email',
        req.body.to || 'unknown',
        req.body.subject || 'unknown',
        req.body.message || 'unknown',
        'failed',
        error instanceof Error ? error.message : 'Unknown error',
        new Date().toISOString()
      ]);
    } catch (logError) {
      console.error('Failed to log alert error:', logError);
    }

    throw createError('Failed to send email alert', 500);
  }
};

// Send WhatsApp alert
export const sendWhatsAppAlert = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      throw createError('Phone number and message are required', 400);
    }

    // Format phone number (add country code if not present)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

    const result = await sendWhatsAppMessage(formattedPhone, message);

    // Log the alert
    await databaseManager.run(`
      INSERT INTO alert_logs (
        id, alert_type, recipient, subject, message, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      require('uuid').v4(),
      'whatsapp',
      formattedPhone,
      'WhatsApp Alert',
      message,
      'sent',
      new Date().toISOString()
    ]);

    res.json({
      success: true,
      data: result,
      message: 'WhatsApp alert sent successfully'
    });

  } catch (error) {
    console.error('Send WhatsApp alert error:', error);
    
    // Log failed alert
    try {
      await databaseManager.run(`
        INSERT INTO alert_logs (
          id, alert_type, recipient, subject, message, status, error_message, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        require('uuid').v4(),
        'whatsapp',
        req.body.phoneNumber || 'unknown',
        'WhatsApp Alert',
        req.body.message || 'unknown',
        'failed',
        error instanceof Error ? error.message : 'Unknown error',
        new Date().toISOString()
      ]);
    } catch (logError) {
      console.error('Failed to log alert error:', logError);
    }

    throw createError('Failed to send WhatsApp alert', 500);
  }
};

// Send low stock alert
export const sendLowStockAlert = async (req: Request, res: Response) => {
  try {
    const { item_id } = req.params;
    const { recipients } = req.body;

    // Get item details
    const item = await databaseManager.get(`
      SELECT 
        i.*,
        c.name as category_name
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ?
    `, [item_id]);

    if (!item) {
      throw createError('Inventory item not found', 404);
    }

    const stockNeeded = item.min_stock_level - item.current_stock;
    const message = `🚨 LOW STOCK ALERT 🚨

Item: ${item.name}
Category: ${item.category_name}
Current Stock: ${item.current_stock}
Minimum Required: ${item.min_stock_level}
Stock Needed: ${stockNeeded}

Please restock immediately to avoid stockouts.

Generated at: ${new Date().toLocaleString()}`;

    const emailSubject = `Low Stock Alert - ${item.name}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff4444;">🚨 LOW STOCK ALERT 🚨</h2>
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px;">
          <h3>${item.name}</h3>
          <p><strong>Category:</strong> ${item.category_name}</p>
          <p><strong>Current Stock:</strong> ${item.current_stock}</p>
          <p><strong>Minimum Required:</strong> ${item.min_stock_level}</p>
          <p><strong>Stock Needed:</strong> ${stockNeeded}</p>
          <p style="color: #ff4444; font-weight: bold;">Please restock immediately to avoid stockouts.</p>
        </div>
        <p style="color: #666; font-size: 12px;">Generated at: ${new Date().toLocaleString()}</p>
      </div>
    `;

    const results = [];

    // Send to all recipients
    for (const recipient of recipients) {
      try {
        if (recipient.type === 'email' && recipient.value) {
          const transporter = createEmailTransporter();
          await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: recipient.value,
            subject: emailSubject,
            text: message,
            html: emailHtml
          });
          results.push({ type: 'email', recipient: recipient.value, status: 'sent' });
        } else if (recipient.type === 'whatsapp' && recipient.value) {
          const formattedPhone = recipient.value.startsWith('+') ? recipient.value : `+91${recipient.value}`;
          await sendWhatsAppMessage(formattedPhone, message);
          results.push({ type: 'whatsapp', recipient: formattedPhone, status: 'sent' });
        }
      } catch (error) {
        results.push({ 
          type: recipient.type, 
          recipient: recipient.value, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Log the alert
    await databaseManager.run(`
      INSERT INTO alert_logs (
        id, alert_type, recipient, subject, message, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      require('uuid').v4(),
      'low_stock',
      JSON.stringify(recipients),
      emailSubject,
      message,
      'sent',
      new Date().toISOString()
    ]);

    res.json({
      success: true,
      data: {
        item: item,
        results: results
      },
      message: 'Low stock alert sent successfully'
    });

  } catch (error) {
    console.error('Send low stock alert error:', error);
    throw createError('Failed to send low stock alert', 500);
  }
};

// Send expiry alert
export const sendExpiryAlert = async (req: Request, res: Response) => {
  try {
    const { item_id } = req.params;
    const { recipients } = req.body;

    // Get item details
    const item = await databaseManager.get(`
      SELECT 
        i.*,
        c.name as category_name
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ?
    `, [item_id]);

    if (!item) {
      throw createError('Inventory item not found', 404);
    }

    const daysUntilExpiry = Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    const message = `⚠️ EXPIRY ALERT ⚠️

Item: ${item.name}
Category: ${item.category_name}
Current Stock: ${item.current_stock}
Expiry Date: ${new Date(item.expiry_date).toLocaleDateString()}
Days Until Expiry: ${daysUntilExpiry}

Please use this item soon or consider discounting it.

Generated at: ${new Date().toLocaleString()}`;

    const emailSubject = `Expiry Alert - ${item.name}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff8800;">⚠️ EXPIRY ALERT ⚠️</h2>
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px;">
          <h3>${item.name}</h3>
          <p><strong>Category:</strong> ${item.category_name}</p>
          <p><strong>Current Stock:</strong> ${item.current_stock}</p>
          <p><strong>Expiry Date:</strong> ${new Date(item.expiry_date).toLocaleDateString()}</p>
          <p><strong>Days Until Expiry:</strong> ${daysUntilExpiry}</p>
          <p style="color: #ff8800; font-weight: bold;">Please use this item soon or consider discounting it.</p>
        </div>
        <p style="color: #666; font-size: 12px;">Generated at: ${new Date().toLocaleString()}</p>
      </div>
    `;

    const results = [];

    // Send to all recipients
    for (const recipient of recipients) {
      try {
        if (recipient.type === 'email' && recipient.value) {
          const transporter = createEmailTransporter();
          await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: recipient.value,
            subject: emailSubject,
            text: message,
            html: emailHtml
          });
          results.push({ type: 'email', recipient: recipient.value, status: 'sent' });
        } else if (recipient.type === 'whatsapp' && recipient.value) {
          const formattedPhone = recipient.value.startsWith('+') ? recipient.value : `+91${recipient.value}`;
          await sendWhatsAppMessage(formattedPhone, message);
          results.push({ type: 'whatsapp', recipient: formattedPhone, status: 'sent' });
        }
      } catch (error) {
        results.push({ 
          type: recipient.type, 
          recipient: recipient.value, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Log the alert
    await databaseManager.run(`
      INSERT INTO alert_logs (
        id, alert_type, recipient, subject, message, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      require('uuid').v4(),
      'expiry',
      JSON.stringify(recipients),
      emailSubject,
      message,
      'sent',
      new Date().toISOString()
    ]);

    res.json({
      success: true,
      data: {
        item: item,
        results: results
      },
      message: 'Expiry alert sent successfully'
    });

  } catch (error) {
    console.error('Send expiry alert error:', error);
    throw createError('Failed to send expiry alert', 500);
  }
};

// Get alert logs
export const getAlertLogs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (type) {
      whereClause += ' AND alert_type = ?';
      params.push(type);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const logs = await databaseManager.all(`
      SELECT * FROM alert_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, Number(limit), offset]);

    const total = await databaseManager.get(`
      SELECT COUNT(*) as count
      FROM alert_logs
      ${whereClause}
    `, params);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: total.count,
          pages: Math.ceil(total.count / Number(limit))
        }
      },
      message: 'Alert logs retrieved successfully'
    });

  } catch (error) {
    console.error('Get alert logs error:', error);
    throw createError('Failed to get alert logs', 500);
  }
};

// Test alert configuration
export const testAlertConfiguration = async (req: Request, res: Response) => {
  try {
    const { type, recipient } = req.body;

    if (!type || !recipient) {
      throw createError('Alert type and recipient are required', 400);
    }

    const testMessage = `🧪 TEST ALERT 🧪

This is a test message from Smoocho POS system.
Time: ${new Date().toLocaleString()}

If you receive this message, your alert configuration is working correctly!`;

    let result;

    if (type === 'email') {
      const transporter = createEmailTransporter();
      result = await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: recipient,
        subject: 'Smoocho POS - Test Alert',
        text: testMessage,
        html: `<div style="font-family: Arial, sans-serif;">${testMessage.replace(/\n/g, '<br>')}</div>`
      });
    } else if (type === 'whatsapp') {
      const formattedPhone = recipient.startsWith('+') ? recipient : `+91${recipient}`;
      result = await sendWhatsAppMessage(formattedPhone, testMessage);
    } else {
      throw createError('Invalid alert type. Use "email" or "whatsapp"', 400);
    }

    res.json({
      success: true,
      data: result,
      message: 'Test alert sent successfully'
    });

  } catch (error) {
    console.error('Test alert configuration error:', error);
    throw createError('Failed to send test alert', 500);
  }
};
