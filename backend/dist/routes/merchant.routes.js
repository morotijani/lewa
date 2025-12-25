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
const merchant_service_1 = require("../services/merchant.service");
const router = express_1.default.Router();
// Public: Get all active merchants (for customer app/discovery)
router.get('/active', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const merchants = yield merchant_service_1.MerchantService.getVerifiedMerchants();
        res.json(merchants);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// IMPORTANT: Static routes must come BEFORE dynamic ID routes
// Get Profile by User ID (Fallback for Login)
router.get('/user/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const merchant = yield merchant_service_1.MerchantService.getMerchantByUserId(req.params.userId);
        if (!merchant)
            return res.status(404).json({ error: 'Merchant not found for this user' });
        res.json(merchant);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Get Profile by Shop ID
router.get('/:merchantId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const merchant = yield merchant_service_1.MerchantService.getMerchantById(req.params.merchantId);
        if (!merchant)
            return res.status(404).json({ error: 'Merchant not found' });
        res.json(merchant);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Get Menu
router.get('/:merchantId/menu', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const menu = yield merchant_service_1.MerchantService.getMenu(req.params.merchantId);
        res.json(menu);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Add Item
router.post('/:merchantId/menu', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield merchant_service_1.MerchantService.addMenuItem(req.params.merchantId, req.body);
        res.json(item);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Update Item
router.patch('/menu/:itemId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield merchant_service_1.MerchantService.updateMenuItem(req.params.itemId, req.body);
        res.json(item);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Delete Item
router.delete('/menu/:itemId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield merchant_service_1.MerchantService.deleteMenuItem(req.params.itemId);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Get Orders
router.get('/:merchantId/orders', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield merchant_service_1.MerchantService.getMerchantOrders(req.params.merchantId);
        res.json(orders);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Update Merchant Details (e.g., Toggle is_open)
router.patch('/:merchantId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const merchant = yield merchant_service_1.MerchantService.updateMerchant(req.params.merchantId, req.body);
        res.json(merchant);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
exports.default = router;
