import express from 'express';
import { MerchantService } from '../services/merchant.service';

const router = express.Router();

// Public: Get all active merchants (for customer app/discovery)
router.get('/active', async (req, res) => {
    try {
        const merchants = await MerchantService.getVerifiedMerchants();
        res.json(merchants);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// IMPORTANT: Static routes must come BEFORE dynamic ID routes
// Get Profile by User ID (Fallback for Login)
router.get('/user/:userId', async (req, res) => {
    try {
        const merchant = await MerchantService.getMerchantByUserId(req.params.userId);
        if (!merchant) return res.status(404).json({ error: 'Merchant not found for this user' });
        res.json(merchant);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get Profile by Shop ID
router.get('/:merchantId', async (req, res) => {
    try {
        const merchant = await MerchantService.getMerchantById(req.params.merchantId);
        if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
        res.json(merchant);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

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

// Update Merchant Details (e.g., Toggle is_open)
router.patch('/:merchantId', async (req, res) => {
    try {
        const merchant = await MerchantService.updateMerchant(req.params.merchantId, req.body);
        res.json(merchant);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
