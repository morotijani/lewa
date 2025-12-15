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
const pricing_service_1 = require("../services/pricing.service");
const router = express_1.default.Router();
router.post('/quote', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pickup, dropoff, vehicleType } = req.body;
        if (!pickup || !dropoff || !vehicleType) {
            return res.status(400).json({ error: 'Missing required fields: pickup, dropoff, vehicleType' });
        }
        // safe parsing
        const p = { lat: parseFloat(pickup.lat), lng: parseFloat(pickup.lng) };
        const d = { lat: parseFloat(dropoff.lat), lng: parseFloat(dropoff.lng) };
        const quote = yield pricing_service_1.PricingService.getQuote(p, d, vehicleType);
        res.json(quote);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
exports.default = router;
