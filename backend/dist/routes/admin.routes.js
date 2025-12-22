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
const admin_service_1 = require("../services/admin.service");
const router = express_1.default.Router();
router.get('/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield admin_service_1.AdminService.getDashboardStats();
        res.json(stats);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
router.get('/couriers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const couriers = yield admin_service_1.AdminService.getActiveCouriers();
        res.json(couriers);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
router.get('/orders', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield admin_service_1.AdminService.getRecentOrders();
        res.json(orders);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
exports.default = router;
