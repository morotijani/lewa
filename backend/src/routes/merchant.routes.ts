import express from 'express';
import { MerchantService } from '../services/merchant.service';

const router = express.Router();

// Get Menu
router.get('/:merchantId/menu', async (req, res) => {
    try {
        const menu = await MerchantService.getMenu(req.params.merchantId);
        res.json(menu);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Add Item
router.post('/:merchantId/menu', async (req, res) => {
    try {
        const item = await MerchantService.addMenuItem(req.params.merchantId, req.body);
        res.json(item);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Update Item
router.patch('/menu/:itemId', async (req, res) => {
    try {
        const item = await MerchantService.updateMenuItem(req.params.itemId, req.body);
        res.json(item);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Item
router.delete('/menu/:itemId', async (req, res) => {
    try {
        await MerchantService.deleteMenuItem(req.params.itemId);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get Orders
router.get('/:merchantId/orders', async (req, res) => {
    try {
        const orders = await MerchantService.getMerchantOrders(req.params.merchantId);
        res.json(orders);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
