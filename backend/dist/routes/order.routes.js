"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_service_1 = require("../services/order.service");
const router = express_1.default.Router();
// Middleware to simulate auth check/user extraction (implement real middleware later)
const mockAuth = (req, res, next) => {
    // For now, assume user ID is passed in headers or body, or use a hardcoded testing ID
    // In production, extract from JWT req.user
    next();
};
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderData = req.body;
        // basic validation
        if (!orderData.customerId || !orderData.pickup || !orderData.dropoff || !orderData.totalAmount) {
            return res.status(400).json({ error: 'Missing required order fields' });
        }
        const order = yield order_service_1.OrderService.createOrder(orderData);
        res.status(201).json(order);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield order_service_1.OrderService.getOrderById(req.params.id);
        if (!order)
            return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
router.patch('/:id/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, userId } = req.body;
        // userId should come from auth token in real app
        if (!status)
            return res.status(400).json({ error: 'Status is required' });
        const order = yield order_service_1.OrderService.updateStatus(req.params.id, status, userId);
        res.json(order);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
router.get('/user/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield order_service_1.OrderService.getUserOrders(req.params.userId);
        res.json(orders);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
router.post('/:id/decline', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        // In real app, userId comes from auth token
        if (!userId)
            return res.status(400).json({ error: 'UserId is required' });
        const result = yield order_service_1.OrderService.declineOrder(req.params.id, userId);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
const dispatch_service_1 = require("../services/dispatch.service");
// ... existing imports
router.post('/:id/assign', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dispatch_service_1.DispatchService.assignOrder(req.params.id);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
exports.default = router;
