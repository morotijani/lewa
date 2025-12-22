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
                // Trigger Dispatch asynchronously
                // REMOVED: Auto-dispatch is now triggered when Merchant accepts the order (status: 'confirmed')
                // const { DispatchService } = require('./dispatch.service');
                // DispatchService.assignOrder(newOrder.id).catch((err: any) => console.error('Auto-dispatch failed:', err));
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
    updateStatus(orderId, status, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate transition? (e.g. created -> assigned -> accepted -> picked_up -> delivered)
            // For MVP, just update.
            // userId used for validation (is this the courier assigned?)
            const client = yield db_1.default.connect();
            try {
                yield client.query('BEGIN');
                const result = yield client.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [status, orderId]);
                if (result.rowCount === 0)
                    throw new Error('Order not found');
                const updatedOrder = result.rows[0];
                yield client.query('COMMIT');
                // Emit update
                const { SocketService } = require('./socket.service');
                SocketService.emitToRoom(`order_${orderId}`, 'orderStatusUpdated', { orderId, status, order: updatedOrder });
                SocketService.emitToRoom(`user_${updatedOrder.customer_id}`, 'orderStatusUpdated', { orderId, status, order: updatedOrder });
                // TRIGGER DISPATCH IF MERCHANT ACCEPTED
                if (status === 'accepted') {
                    const { DispatchService } = require('./dispatch.service');
                    // We don't await this to keep response fast, but in prod consider queue
                    DispatchService.assignOrder(orderId).catch((err) => console.error('Dispatch failed:', err));
                }
                return updatedOrder;
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
    getUserOrders(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC', [userId]);
            return result.rows;
        });
    },
    declineOrder(orderId, courierId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.connect();
            try {
                yield client.query('BEGIN');
                // Verify order is assigned to this courier
                // Note: We need to check if courierId matches the order's courier_id
                // Ideally we get the courier primary key (id) from the user_id (courierId arg might be user_id)
                // Let's assume courierId passed here is the USER ID, so we look up the courier profile first.
                const courierRes = yield client.query('SELECT id FROM couriers WHERE user_id = $1', [courierId]);
                if (courierRes.rows.length === 0)
                    throw new Error('Courier profile not found');
                const courierProfileId = courierRes.rows[0].id;
                const orderRes = yield client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
                const order = orderRes.rows[0];
                if (!order)
                    throw new Error('Order not found');
                if (order.courier_id !== courierProfileId) {
                    throw new Error('Order is not assigned to this courier');
                }
                // Unassign
                const updateRes = yield client.query(`UPDATE orders SET courier_id = NULL, status = 'accepted', updated_at = NOW() WHERE id = $1 RETURNING *`, [orderId]);
                const updatedOrder = updateRes.rows[0];
                yield client.query('COMMIT');
                // Notify that order is back in pool?
                // Actually, if status is 'accepted', the merchant dashboard sees it.
                // We might want to trigger a "redispatch" or just let it sit until another mechanism picks it up.
                // For MVP, simplistic release is fine.
                return updatedOrder;
            }
            catch (e) {
                yield client.query('ROLLBACK');
                throw e;
            }
            finally {
                client.release();
            }
        });
    }
};
