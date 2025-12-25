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
exports.CronService = void 0;
const db_1 = __importDefault(require("../db"));
const socket_service_1 = require("./socket.service");
const CHECK_INTERVAL_MS = 60 * 1000; // 1 Minute
const TIMEOUT_MINUTES = 10;
exports.CronService = {
    startOrderTimeoutCheck() {
        console.log('Starting Order Timeout Check Job...');
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield db_1.default.connect();
                try {
                    // Find Stale Orders
                    const query = `
            SELECT * FROM orders 
            WHERE status IN ('created', 'accepted') 
            AND updated_at < NOW() - INTERVAL '${TIMEOUT_MINUTES} minutes'
          `;
                    const res = yield client.query(query);
                    if (res.rows.length > 0) {
                        console.log(`Found ${res.rows.length} stale orders.`);
                        for (const order of res.rows) {
                            yield client.query('BEGIN');
                            const cancelQuery = `
                UPDATE orders 
                SET status = 'cancelled', 
                    notes = COALESCE(notes, '') || ' [System]: Cancelled due to no courier availability.',
                    updated_at = NOW() 
                WHERE id = $1 
                RETURNING *
              `;
                            const updateRes = yield client.query(cancelQuery, [order.id]);
                            const cancelledOrder = updateRes.rows[0];
                            yield client.query('COMMIT');
                            // Notify Customer
                            console.log(`Auto-cancelling order ${order.id}`);
                            socket_service_1.SocketService.emitToRoom(`order_${order.id}`, 'orderStatusUpdated', {
                                orderId: order.id,
                                status: 'cancelled',
                                order: cancelledOrder,
                                message: 'Order cancelled. No couriers found nearby.'
                            });
                            socket_service_1.SocketService.emitToRoom(`user_${order.customer_id}`, 'orderStatusUpdated', {
                                orderId: order.id,
                                status: 'cancelled',
                                order: cancelledOrder,
                                message: 'Order cancelled. No couriers found nearby. You will not be charged.'
                            });
                            // In a real system, trigger refund logic here if paid
                        }
                    }
                }
                finally {
                    client.release();
                }
            }
            catch (err) {
                console.error('Cron Job Error:', err);
            }
        }), CHECK_INTERVAL_MS);
    }
};
