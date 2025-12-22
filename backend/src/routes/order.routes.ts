import express from 'express';
import { OrderService } from '../services/order.service';

const router = express.Router();

// Middleware to simulate auth check/user extraction (implement real middleware later)
const mockAuth = (req: any, res: any, next: any) => {
    // For now, assume user ID is passed in headers or body, or use a hardcoded testing ID
    // In production, extract from JWT req.user
    next();
};

router.post('/', async (req, res) => {
    try {
        const orderData = req.body;
        // basic validation
        if (!orderData.customerId || !orderData.pickup || !orderData.dropoff || !orderData.totalAmount) {
            return res.status(400).json({ error: 'Missing required order fields' });
        }
        const order = await OrderService.createOrder(orderData);
        res.status(201).json(order);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const order = await OrderService.getOrderById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:id/status', async (req, res) => {
    try {
        const { status, userId } = req.body;
        // userId should come from auth token in real app
        if (!status) return res.status(400).json({ error: 'Status is required' });

        const order = await OrderService.updateStatus(req.params.id, status, userId);
        res.json(order);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await OrderService.getUserOrders(req.params.userId);
        res.json(orders);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

import { DispatchService } from '../services/dispatch.service';

// ... existing imports

router.post('/:id/assign', async (req, res) => {
    try {
        const result = await DispatchService.assignOrder(req.params.id);
        res.json(result);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
