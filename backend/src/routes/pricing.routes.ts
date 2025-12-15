import express from 'express';
import { PricingService } from '../services/pricing.service';

const router = express.Router();

router.post('/quote', async (req, res) => {
    try {
        const { pickup, dropoff, vehicleType } = req.body;

        if (!pickup || !dropoff || !vehicleType) {
            return res.status(400).json({ error: 'Missing required fields: pickup, dropoff, vehicleType' });
        }

        // safe parsing
        const p = { lat: parseFloat(pickup.lat), lng: parseFloat(pickup.lng) };
        const d = { lat: parseFloat(dropoff.lat), lng: parseFloat(dropoff.lng) };

        const quote = await PricingService.getQuote(p, d, vehicleType);
        res.json(quote);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
