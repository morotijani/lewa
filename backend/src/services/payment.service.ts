import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

export const PaymentService = {
    async initiatePayment(orderId: string, amount: number, provider: string = 'mtn_momo') {
        const client = await pool.connect();
        try {
            // 1. Create Payment Record
            const reference = uuidv4(); // Generate a unique reference
            const result = await client.query(
                `INSERT INTO payments (order_id, amount_ghs, provider, status, provider_reference)
         VALUES ($1, $2, $3, 'pending', $4)
         RETURNING *`,
                [orderId, amount, provider, reference]
            );

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
        } finally {
            client.release();
        }
    },

    async handleWebhook(event: { event: string; data: any }) {
        // Mock webhook payload handling
        // Expecting event: 'charge.success', data: { reference: '...' }

        if (event.event === 'charge.success') {
            const reference = event.data.reference;

            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // 1. Get Payment
                const payRes = await client.query(
                    'SELECT * FROM payments WHERE provider_reference = $1',
                    [reference]
                );
                const payment = payRes.rows[0];

                if (!payment) throw new Error('Payment not found');
                if (payment.status === 'success') return { message: 'Already processed' };

                // 2. Update Payment
                await client.query(
                    `UPDATE payments SET status = 'success', metadata = $1 WHERE id = $2`,
                    [JSON.stringify(event.data), payment.id]
                );

                // 3. Update Order
                await client.query(
                    `UPDATE orders SET payment_status = 'paid', updated_at = NOW() WHERE id = $1`,
                    [payment.order_id]
                );

                await client.query('COMMIT');
                console.log(`Payment ${payment.id} processed successfully for Order ${payment.order_id}`);
                return { success: true };

            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release();
            }
        }

        return { success: false, message: 'Event ignored' };
    }
};
