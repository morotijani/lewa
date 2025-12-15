import express from 'express';
import { PaymentService } from '../services/payment.service';

const router = express.Router();

router.post('/initiate', async (req, res) => {
    try {
        const { orderId, amount, provider } = req.body;
        if (!orderId || !amount) {
            return res.status(400).json({ error: 'Missing orderId or amount' });
        }
        const result = await PaymentService.initiatePayment(orderId, amount, provider);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/webhook', async (req, res) => {
    try {
        // Basic webhook handler (no signature verification for mock)
        const result = await PaymentService.handleWebhook(req.body);
        res.json(result);
    } catch (err: any) {
        console.error('Webhook Error:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
