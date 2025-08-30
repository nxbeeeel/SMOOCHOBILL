"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const database_1 = __importDefault(require("./database"));
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const orders_1 = __importDefault(require("./routes/orders"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const reports_1 = __importDefault(require("./routes/reports"));
const integrations_1 = __importDefault(require("./routes/integrations"));
const alerts_1 = __importDefault(require("./routes/alerts"));
const printer_1 = __importDefault(require("./routes/printer"));
const auth_2 = require("./middleware/auth");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const websocket_1 = require("./services/websocket");
const app = (0, express_1.default)();
exports.app = app;
app.set('trust proxy', 1);
const server = (0, http_1.createServer)(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
exports.io = io;
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
}));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(rateLimiter_1.rateLimiter);
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/products', auth_2.authenticateToken, products_1.default);
app.use('/api/orders', auth_2.authenticateToken, orders_1.default);
app.use('/api/inventory', auth_2.authenticateToken, inventory_1.default);
app.use('/api/reports', auth_2.authenticateToken, reports_1.default);
app.use('/api/integrations', auth_2.authenticateToken, integrations_1.default);
app.use('/api/alerts', auth_2.authenticateToken, alerts_1.default);
app.use('/api/printer', auth_2.authenticateToken, printer_1.default);
(0, websocket_1.setupWebSocket)(io);
app.use(errorHandler_1.errorHandler);
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await database_1.default.close();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await database_1.default.close();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
async function startServer() {
    try {
        await database_1.default.initialize();
        await database_1.default.initializeData();
        server.listen(PORT, () => {
            console.log(`🚀 Smoocho POS Server running on port ${PORT}`);
            console.log(`📊 Database initialized successfully`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map