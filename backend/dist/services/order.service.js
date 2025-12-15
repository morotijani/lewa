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
exports.OrderService = void 0;
const db_1 = __importDefault(require("../db"));
exports.OrderService = {
    createOrder(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.connect();
            try {
                yield client.query('BEGIN');
                const queryText = `
        INSERT INTO orders (
          customer_id, 
          pickup_lat, pickup_lng, pickup_address, pickup_phone, pickup_landmark,
          dropoff_lat, dropoff_lng, dropoff_address, dropoff_phone, dropoff_landmark,
          pricing_details, total_amount_ghs, payment_method, notes, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'created')
        RETURNING *
      `;
                const values = [
                    data.customerId,
                    data.pickup.lat, data.pickup.lng, data.pickup.address, data.pickup.phone, data.pickup.landmark,
                    data.dropoff.lat, data.dropoff.lng, data.dropoff.address, data.dropoff.phone, data.dropoff.landmark,
                    data.pricingDetails, data.totalAmount, data.paymentMethod, data.notes
                ];
                const result = yield client.query(queryText, values);
                yield client.query('COMMIT');
                const newOrder = result.rows[0];
                // Emit event
                // dynamically import to avoid circular dep if needed, or just import at top if safe
                // For now, let's assume methods are static and safe
                const { SocketService } = require('./socket.service'); // Using require to avoid potential circular dep issues during init
                SocketService.emitToRoom(`user_${data.customerId}`, 'orderCreated', newOrder);
                return newOrder;
            }
            catch (e) {
                yield client.query('ROLLBACK');
                throw e;
            }
            finally {
                client.release();
            }
        });
    },
    getOrderById(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query('SELECT * FROM orders WHERE id = $1', [orderId]);
            return result.rows[0];
        });
    },
    getUserOrders(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC', [userId]);
            return result.rows;
        });
    }
};
