import express from 'express';
import { AuthService } from '../services/auth.service';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { phone, email, fullName, role, password } = req.body;
        const user = await AuthService.register(phone, email, fullName, role, password);
        res.status(201).json(user);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        const result = await AuthService.login(phone, password);
        res.json(result);
    } catch (err: any) {
        res.status(401).json({ error: err.message });
    }
});

router.post('/register-merchant', async (req, res) => {
    try {
        const result = await AuthService.registerMerchant(req.body);
        res.status(201).json(result);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});


export default router;
