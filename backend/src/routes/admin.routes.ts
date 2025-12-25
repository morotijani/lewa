import express from 'express';
import { AdminService } from '../services/admin.service';

const router = express.Router();

router.get('/stats', async (req, res) => {
    try {
        const stats = await AdminService.getDashboardStats();
        res.json(stats);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/couriers', async (req, res) => {
    try {
        const couriers = await AdminService.getActiveCouriers();
        res.json(couriers);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/orders', async (req, res) => {
    try {
        const orders = await AdminService.getRecentOrders();
        res.json(orders);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/merchants', async (req, res) => {
    try {
        const merchants = await AdminService.getAllMerchants();
        res.json(merchants);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/merchants/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ error: 'Status is required' });
        const merchant = await AdminService.updateMerchantStatus(req.params.id, status);
        res.json(merchant);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

