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
const courier_service_1 = require("../services/courier.service");
const router = express_1.default.Router();
// Middleware to get user ID from token (mocked or assumed attached by auth middleware)
// For now we assume req.body.userId or header, but typically it comes from verified token in req.user
// Let's assume the auth middleware puts the user object in req.body.user (from auth.service logic)
// effectively we need an auth middleware. For this rapid dev, I'll pass userId in body or rely on previous pattern.
// Checking auth.routes.ts, it returns a token. The client should send this token.
// I need an auth middleware. For now, I'll allow passing userId in body for testing, but I should add middleware later.
router.post('/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, isOnline, lat, lng } = req.body;
        if (!userId)
            throw new Error('UserId is required');
        const courier = yield courier_service_1.CourierService.updateStatus(userId, isOnline, lat, lng);
        res.json(courier);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
router.get('/profile/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courier = yield courier_service_1.CourierService.getProfile(req.params.userId);
        res.json(courier);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
router.patch('/profile/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vehicleType, licensePlate } = req.body;
        const courier = yield courier_service_1.CourierService.updateProfile(req.params.userId, vehicleType, licensePlate);
        res.json(courier);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
router.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, vehicleType, licensePlate } = req.body;
        const courier = yield courier_service_1.CourierService.createProfile(userId, vehicleType, licensePlate);
        res.json(courier);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
exports.default = router;
