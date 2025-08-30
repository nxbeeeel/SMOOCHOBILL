import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

// Load environment variables
dotenv.config();

// Import database
import databaseManager from './database';

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import inventoryRoutes from './routes/inventory';
import reportRoutes from './routes/reports';
import integrationRoutes from './routes/integrations';
import alertsRoutes from './routes/alerts';
import printerRoutes from './routes/printer';

// Import middleware
import { authenticateToken } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Import WebSocket handlers
import { setupWebSocket } from './services/websocket';

const app = express();
app.set('trust proxy', 1); // Trust first proxy
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "https://smoochobill.vercel.app",
      "https://smoochobill-git-main-nxbeeeel.vercel.app"
    ],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:3000",
    "https://smoochobill.vercel.app",
    "https://smoochobill-git-main-nxbeeeel.vercel.app"
  ],
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);
app.use('/api/inventory', authenticateToken, inventoryRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);
app.use('/api/integrations', authenticateToken, integrationRoutes);
app.use('/api/alerts', authenticateToken, alertsRoutes);
app.use('/api/printer', authenticateToken, printerRoutes);

// WebSocket setup
setupWebSocket(io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await databaseManager.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await databaseManager.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await databaseManager.initialize();
    await databaseManager.initializeData();
    
    server.listen(PORT, () => {
      console.log(`🚀 Smoocho POS Server running on port ${PORT}`);
      console.log(`📊 Database initialized successfully`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, server, io };

