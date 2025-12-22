"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_service_1 = require("./services/socket.service");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const pricing_routes_1 = __importDefault(require("./routes/pricing.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const courier_routes_1 = __importDefault(require("./routes/courier.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const merchant_routes_1 = __importDefault(require("./routes/merchant.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app); // Wrap express app
const PORT = process.env.PORT || 3000;
// Initialize Socket.io
socket_service_1.SocketService.init(httpServer);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Debug Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/pricing', pricing_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/couriers', courier_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/merchant', merchant_routes_1.default);
app.get('/', (req, res) => {
    res.json({ message: 'Lewa Backend is running', timestamp: new Date() });
});
// Use httpServer.listen instead of app.listen
httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Socket.io server initialized`);
});
