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
const db_1 = __importDefault(require("../db"));
const order_service_1 = require("../services/order.service");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Connecting...');
            // 1. Create a dummy customer
            const customerPhone = '020' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
            const res = yield db_1.default.query(`INSERT INTO users (full_name, phone_number, password_hash, role)
             VALUES ('Test Customer', $1, 'hash', 'customer') RETURNING id`, [customerPhone]);
            const customerId = res.rows[0].id;
            console.log('Created Test Customer:', customerId);
            // 2. Create Order near Legon (Courier is at 5.6508, -0.1870)
            // Let's pickup at 5.6500, -0.1860 (very close)
            const orderData = {
                customerId,
                pickup: {
                    lat: 5.6500,
                    lng: -0.1870, // Same longitude, slightly south
                    address: 'University of Ghana Main Gate',
                    phone: customerPhone
                },
                dropoff: {
                    lat: 5.6037, // Accra
                    lng: -0.1870,
                    address: 'Accra Mall',
                    phone: '0555555555'
                },
                vehicleType: 'motorcycle',
                pricingDetails: { base: 15, distance: 3.5 },
                totalAmount: 20.00,
                paymentMethod: 'cash',
                notes: 'Simulated Order from Script'
            };
            console.log('Creating Order...');
            const order = yield order_service_1.OrderService.createOrder(orderData);
            console.log('Order Created ID:', order.id);
            console.log('Waiting for Auto-Dispatch...');
        }
        catch (e) {
            console.error(e);
        }
        finally {
            // Keep alive for 5 seconds to allow async Dispatch to complete
            setTimeout(() => {
                console.log('Done.');
                db_1.default.end();
            }, 5000);
        }
    });
}
run();
