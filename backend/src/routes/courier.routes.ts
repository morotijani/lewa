import express from 'express';
import { CourierService } from '../services/courier.service';

const router = express.Router();

// Middleware to get user ID from token (mocked or assumed attached by auth middleware)
// For now we assume req.body.userId or header, but typically it comes from verified token in req.user
// Let's assume the auth middleware puts the user object in req.body.user (from auth.service logic)
// effectively we need an auth middleware. For this rapid dev, I'll pass userId in body or rely on previous pattern.
// Checking auth.routes.ts, it returns a token. The client should send this token.
// I need an auth middleware. For now, I'll allow passing userId in body for testing, but I should add middleware later.

router.post('/status', async (req, res) => {
    try {
        const { userId, isOnline, lat, lng } = req.body;
        if (!userId) throw new Error('UserId is required');
        const courier = await CourierService.updateStatus(userId, isOnline, lat, lng);
        res.json(courier);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/profile/:userId', async (req, res) => {
    try {
        const courier = await CourierService.getProfile(req.params.userId);
        res.json(courier);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

router.patch('/profile/:userId', async (req, res) => {
    try {
        const { vehicleType, licensePlate } = req.body;
        const courier = await CourierService.updateProfile(req.params.userId, vehicleType, licensePlate);
        res.json(courier);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/create', async (req, res) => {
    try {
        const { userId, vehicleType, licensePlate } = req.body;
        const courier = await CourierService.createProfile(userId, vehicleType, licensePlate);
        res.json(courier);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
