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
exports.PaymentService = void 0;
const db_1 = __importDefault(require("../db"));
const uuid_1 = require("uuid");
exports.PaymentService = {
    initiatePayment(orderId_1, amount_1) {
        return __awaiter(this, arguments, void 0, function* (orderId, amount, provider = 'mtn_momo') {
            const client = yield db_1.default.connect();
            try {
                // 1. Create Payment Record
                const reference = (0, uuid_1.v4)(); // Generate a unique reference
                const result = yield client.query(`INSERT INTO payments (order_id, amount_ghs, provider, status, provider_reference)
         VALUES ($1, $2, $3, 'pending', $4)
         RETURNING *`, [orderId, amount, provider, reference]);
                const payment = result.rows[0];
                // 2. Mock Provider Response
                // In reality, we would call axios.post('https://api.paystack.co/transaction/initialize', ...)
                const checkoutUrl = `https://checkout.mock-provider.com/pay/${reference}`;
                return {
                    paymentId: payment.id,
                    reference: reference,
                    checkoutUrl: checkoutUrl,
                    message: 'Payment initiated. Use the callback URL to simulate success.'
                };
            }
            finally {
                client.release();
            }
        });
    },
    handleWebhook(event) {
        return __awaiter(this, void 0, void 0, function* () {
            // Mock webhook payload handling
            // Expecting event: 'charge.success', data: { reference: '...' }
            if (event.event === 'charge.success') {
                const reference = event.data.reference;
                const client = yield db_1.default.connect();
                try {
                    yield client.query('BEGIN');
                    // 1. Get Payment
                    const payRes = yield client.query('SELECT * FROM payments WHERE provider_reference = $1', [reference]);
                    const payment = payRes.rows[0];
                    if (!payment)
                        throw new Error('Payment not found');
                    if (payment.status === 'success')
                        return { message: 'Already processed' };
                    // 2. Update Payment
                    yield client.query(`UPDATE payments SET status = 'success', metadata = $1 WHERE id = $2`, [JSON.stringify(event.data), payment.id]);
                    // 3. Update Order
                    yield client.query(`UPDATE orders SET payment_status = 'paid', updated_at = NOW() WHERE id = $1`, [payment.order_id]);
                    yield client.query('COMMIT');
                    const { SocketService } = require('./socket.service');
                    SocketService.emitToRoom(`order_${payment.order_id}`, 'orderStatusUpdated', { status: 'paid' });
                    // Also emit to user private room
                    // We'd need user ID here, but let's assume client is listening to order room or we fetch order first
                    // Simple fix: fetch order customer_id if needed, but order room should suffice for now
                    console.log(`Payment ${payment.id} processed successfully for Order ${payment.order_id}`);
                    return { success: true };
                }
                catch (e) {
                    yield client.query('ROLLBACK');
                    throw e;
                }
                finally {
                    client.release();
                }
            }
            return { success: false, message: 'Event ignored' };
        });
    }
};
