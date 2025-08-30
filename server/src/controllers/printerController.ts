import { Request, Response } from 'express';
import databaseManager from '../database';
import { createError } from '../middleware/errorHandler';
import { SerialPort } from 'serialport';

// Printer configuration
interface PrinterConfig {
  port: string;
  baudRate: number;
  dataBits: 5 | 6 | 7 | 8;
  stopBits: 1 | 1.5 | 2;
  parity: 'none' | 'even' | 'odd';
}

// Get printer configuration
const getDefaultPrinterConfig = (): PrinterConfig => {
  return {
    port: process.env.PRINTER_PORT || 'COM3',
    baudRate: Number(process.env.PRINTER_BAUDRATE) || 9600,
    dataBits: 8 as const,
    stopBits: 1 as const,
    parity: 'none' as const
  };
};

// Send data to printer
const sendToPrinter = async (data: string): Promise<void> => {
  const config = getDefaultPrinterConfig();
  
  return new Promise((resolve, reject) => {
    const port = new SerialPort({
      path: config.port,
      baudRate: config.baudRate,
      dataBits: config.dataBits,
      stopBits: config.stopBits,
      parity: config.parity
    });

    port.on('open', () => {
      port.write(data, (err) => {
        if (err) {
          reject(err);
        } else {
          port.close();
          resolve();
        }
      });
    });

    port.on('error', (err) => {
      reject(err);
    });
  });
};

// Generate bill content
const generateBillContent = (order: any, items: any[]): string => {
  const now = new Date();
  
  let content = '';
  
  // Header
  content += '\x1B\x40'; // Initialize printer
  content += '\x1B\x61\x01'; // Center alignment
  content += '\x1B\x21\x10'; // Double height and width
  content += 'SMOOCHO\n';
  content += '\x1B\x21\x00'; // Normal size
  content += 'Dessert Paradise\n';
  content += '--------------------------------\n';
  content += '\x1B\x61\x00'; // Left alignment
  
  // Order details
  content += `Order #: ${order.order_number}\n`;
  content += `Date: ${now.toLocaleDateString()}\n`;
  content += `Time: ${now.toLocaleTimeString()}\n`;
  content += `Type: ${order.order_type.toUpperCase()}\n`;
  
  if (order.customer_name) {
    content += `Customer: ${order.customer_name}\n`;
  }
  
  if (order.customer_phone) {
    content += `Phone: ${order.customer_phone}\n`;
  }
  
  content += '--------------------------------\n';
  
  // Items
  content += 'ITEMS:\n';
  items.forEach((item, index) => {
    content += `${index + 1}. ${item.product_name}\n`;
    content += `   ${item.quantity} x ₹${item.unit_price} = ₹${item.total_price}\n`;
    if (item.notes) {
      content += `   Note: ${item.notes}\n`;
    }
  });
  
  content += '--------------------------------\n';
  
  // Totals
  content += `Subtotal:     ₹${order.subtotal.toFixed(2)}\n`;
  
  if (order.discount_amount > 0) {
    const discountType = order.discount_type === 'percentage' ? '%' : '₹';
    content += `Discount:     ${discountType}${order.discount_amount.toFixed(2)}\n`;
  }
  
  if (order.tax_amount > 0) {
    content += `Tax:          ₹${order.tax_amount.toFixed(2)}\n`;
  }
  
  content += '--------------------------------\n';
  content += '\x1B\x21\x10'; // Double height and width
  content += `TOTAL:        ₹${order.total_amount.toFixed(2)}\n`;
  content += '\x1B\x21\x00'; // Normal size
  
  // Payment method
  content += '--------------------------------\n';
  content += `Payment: ${order.payment_method.toUpperCase()}\n`;
  content += `Status: ${order.payment_status.toUpperCase()}\n`;
  
  // Footer
  content += '--------------------------------\n';
  content += '\x1B\x61\x01'; // Center alignment
  content += 'Thank you for visiting!\n';
  content += 'Please come again\n';
  content += '\n\n\n\n\n'; // Feed paper
  
  return content;
};

// Print bill
export const printBill = async (req: Request, res: Response) => {
  try {
    const { order_id } = req.params;

    // Get order details
    const order = await databaseManager.get(`
      SELECT * FROM orders WHERE id = ?
    `, [order_id]);

    if (!order) {
      throw createError('Order not found', 404);
    }

    // Get order items
    const items = await databaseManager.all(`
      SELECT * FROM order_items WHERE order_id = ?
    `, [order_id]);

    // Generate bill content
    const billContent = generateBillContent(order, items);

    // Send to printer
    await sendToPrinter(billContent);

    // Log print action
    await databaseManager.run(`
      INSERT INTO print_logs (
        id, order_id, print_type, content, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      require('uuid').v4(),
      order_id,
      'bill',
      billContent,
      'success',
      new Date().toISOString()
    ]);

    res.json({
      success: true,
      data: { order_id, print_type: 'bill' },
      message: 'Bill printed successfully'
    });

  } catch (error) {
    console.error('Print bill error:', error);
    
    // Log failed print
    try {
      await databaseManager.run(`
        INSERT INTO print_logs (
          id, order_id, print_type, content, status, error_message, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        require('uuid').v4(),
        req.params.order_id,
        'bill',
        '',
        'failed',
        error instanceof Error ? error.message : 'Unknown error',
        new Date().toISOString()
      ]);
    } catch (logError) {
      console.error('Failed to log print error:', logError);
    }

    throw createError('Failed to print bill', 500);
  }
};

// Print daily summary
export const printDailySummary = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();
    const dateStr = targetDate.toISOString().split('T')[0];

    // Get daily summary data
    const summary = await databaseManager.get(`
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        SUM(CASE WHEN o.payment_status = 'completed' THEN o.total_amount ELSE 0 END) as total_revenue,
        AVG(CASE WHEN o.payment_status = 'completed' THEN o.total_amount ELSE NULL END) as average_order_value
      FROM orders o
      WHERE DATE(o.created_at) = ?
    `, [dateStr]);

    // Get payment breakdown
    const paymentBreakdown = await databaseManager.all(`
      SELECT 
        payment_method,
        COUNT(*) as order_count,
        SUM(total_amount) as total_amount
      FROM orders
      WHERE DATE(created_at) = ? AND payment_status = 'completed'
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `, [dateStr]);

    // Generate summary content
    let content = '';
    
    content += '\x1B\x40'; // Initialize printer
    content += '\x1B\x61\x01'; // Center alignment
    content += '\x1B\x21\x10'; // Double height and width
    content += 'DAILY SUMMARY\n';
    content += '\x1B\x21\x00'; // Normal size
    content += `${dateStr}\n`;
    content += '--------------------------------\n';
    content += '\x1B\x61\x00'; // Left alignment
    
    content += `Total Orders: ${summary.total_orders}\n`;
    content += `Total Revenue: ₹${summary.total_revenue?.toFixed(2) || '0.00'}\n`;
    content += `Avg Order: ₹${summary.average_order_value?.toFixed(2) || '0.00'}\n`;
    
    content += '--------------------------------\n';
    content += 'PAYMENT BREAKDOWN:\n';
    
    paymentBreakdown.forEach((payment) => {
      content += `${payment.payment_method.toUpperCase()}: ${payment.order_count} orders\n`;
      content += `  ₹${payment.total_amount.toFixed(2)}\n`;
    });
    
    content += '--------------------------------\n';
    content += '\x1B\x61\x01'; // Center alignment
    content += 'End of Report\n';
    content += '\n\n\n\n\n'; // Feed paper

    // Send to printer
    await sendToPrinter(content);

    // Log print action
    await databaseManager.run(`
      INSERT INTO print_logs (
        id, order_id, print_type, content, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      require('uuid').v4(),
      null,
      'daily_summary',
      content,
      'success',
      new Date().toISOString()
    ]);

    res.json({
      success: true,
      data: { date: dateStr, print_type: 'daily_summary' },
      message: 'Daily summary printed successfully'
    });

  } catch (error) {
    console.error('Print daily summary error:', error);
    throw createError('Failed to print daily summary', 500);
  }
};

// Test printer connection
export const testPrinter = async (req: Request, res: Response) => {
  try {
    const testContent = `
\x1B\x40
\x1B\x61\x01
\x1B\x21\x10
PRINTER TEST
\x1B\x21\x00
Smoocho POS System
--------------------------------
Time: ${new Date().toLocaleString()}
Status: Connected
--------------------------------
If you can see this, your printer
is working correctly!
--------------------------------

\n\n\n\n\n
`;

    await sendToPrinter(testContent);

    res.json({
      success: true,
      data: { message: 'Test print sent successfully' },
      message: 'Printer test completed'
    });

  } catch (error) {
    console.error('Test printer error:', error);
    throw createError('Printer test failed', 500);
  }
};

// Get printer configuration
export const getPrinterConfig = async (req: Request, res: Response) => {
  try {
    const config = getDefaultPrinterConfig();

    res.json({
      success: true,
      data: config,
      message: 'Printer configuration retrieved successfully'
    });

  } catch (error) {
    console.error('Get printer config error:', error);
    throw createError('Failed to get printer configuration', 500);
  }
};

// Update printer configuration
export const updatePrinterConfig = async (req: Request, res: Response) => {
  try {
    const { port, baudRate } = req.body;

    // In a real application, you would save this to a config file or database
    // For now, we'll just validate the input
    
    if (!port || !baudRate) {
      throw createError('Port and baud rate are required', 400);
    }

    // Validate baud rate
    const validBaudRates = [9600, 19200, 38400, 57600, 115200];
    if (!validBaudRates.includes(Number(baudRate))) {
      throw createError('Invalid baud rate', 400);
    }

    res.json({
      success: true,
      data: { port, baudRate: Number(baudRate) },
      message: 'Printer configuration updated successfully'
    });

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    console.error('Update printer config error:', error);
    throw createError('Failed to update printer configuration', 500);
  }
};

// Get print logs
export const getPrintLogs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (type) {
      whereClause += ' AND print_type = ?';
      params.push(type);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const logs = await databaseManager.all(`
      SELECT * FROM print_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, Number(limit), offset]);

    const total = await databaseManager.get(`
      SELECT COUNT(*) as count
      FROM print_logs
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
      message: 'Print logs retrieved successfully'
    });

  } catch (error) {
    console.error('Get print logs error:', error);
    throw createError('Failed to get print logs', 500);
  }
};
