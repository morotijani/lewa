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
const payment_service_1 = require("../services/payment.service");
const router = express_1.default.Router();
router.post('/initiate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId, amount, provider } = req.body;
        if (!orderId || !amount) {
            return res.status(400).json({ error: 'Missing orderId or amount' });
        }
        const result = yield payment_service_1.PaymentService.initiatePayment(orderId, amount, provider);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
router.post('/webhook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Basic webhook handler (no signature verification for mock)
        const result = yield payment_service_1.PaymentService.handleWebhook(req.body);
        res.json(result);
    }
    catch (err) {
        console.error('Webhook Error:', err);
        res.status(500).json({ error: err.message });
    }
}));
exports.default = router;
