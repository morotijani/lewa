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
exports.AdminService = void 0;
const db_1 = __importDefault(require("../db"));
exports.AdminService = {
    getDashboardStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.connect();
            try {
                // Total Orders
                const ordersRes = yield client.query('SELECT COUNT(*) FROM orders');
                const totalOrders = parseInt(ordersRes.rows[0].count);
                // Active Couriers
                const couriersRes = yield client.query('SELECT COUNT(*) FROM couriers WHERE is_online = true');
                const activeCouriers = parseInt(couriersRes.rows[0].count);
                // Pending Deliveries (anything not delivered or cancelled)
                const pendingRes = yield client.query("SELECT COUNT(*) FROM orders WHERE status NOT IN ('delivered', 'cancelled')");
                const pendingDeliveries = parseInt(pendingRes.rows[0].count);
                // Total Revenue (Sum of total_amount_ghs)
                const revenueRes = yield client.query('SELECT SUM(total_amount_ghs) FROM orders WHERE status = \'delivered\''); // Only count revenue from delivered orders? Or all created? Let's say delivered for accuracy.
                const totalRevenue = parseFloat(revenueRes.rows[0].sum || '0');
                return {
                    totalOrders,
                    activeCouriers,
                    pendingDeliveries,
                    totalRevenue
                };
            }
            finally {
                client.release();
            }
        });
    },
    getActiveCouriers() {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch online couriers with their user names and locations
            const res = yield db_1.default.query(`
            SELECT c.id, c.user_id, c.current_lat, c.current_lng, c.vehicle_type, u.full_name, c.is_online
            FROM couriers c
            JOIN users u ON c.user_id = u.id
            WHERE c.is_online = true
        `);
            return res.rows;
        });
    },
    getRecentOrders() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield db_1.default.query(`
            SELECT o.*, u.full_name as customer_name
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 10
        `);
            return res.rows;
        });
    },
    getAllMerchants() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield db_1.default.query(`
            SELECT m.*, u.full_name as owner_name, u.email as owner_email, u.phone_number
            FROM merchants m
            JOIN users u ON m.user_id = u.id
            ORDER BY m.created_at DESC
        `);
            return res.rows;
        });
    },
    updateMerchantStatus(merchantId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield db_1.default.query('UPDATE merchants SET status = $1 WHERE id = $2 RETURNING *', [status, merchantId]);
            return res.rows[0];
        });
    }
};
