
import pool from '../db';
import { SocketService } from './socket.service';

const CHECK_INTERVAL_MS = 60 * 1000; // 1 Minute
const TIMEOUT_MINUTES = 10;

export const CronService = {
    startOrderTimeoutCheck() {
        console.log('Starting Order Timeout Check Job...');

        setInterval(async () => {
            try {
                const client = await pool.connect();
                try {
                    // Find Stale Orders
                    const query = `
            SELECT * FROM orders 
            WHERE status IN ('created', 'accepted') 
            AND updated_at < NOW() - INTERVAL '${TIMEOUT_MINUTES} minutes'
          `;
                    const res = await client.query(query);

                    if (res.rows.length > 0) {
                        console.log(`Found ${res.rows.length} stale orders.`);

                        for (const order of res.rows) {
                            await client.query('BEGIN');

                            const cancelQuery = `
                UPDATE orders 
                SET status = 'cancelled', 
                    notes = COALESCE(notes, '') || ' [System]: Cancelled due to no courier availability.',
                    updated_at = NOW() 
                WHERE id = $1 
                RETURNING *
              `;
                            const updateRes = await client.query(cancelQuery, [order.id]);
                            const cancelledOrder = updateRes.rows[0];

                            await client.query('COMMIT');

                            // Notify Customer
                            console.log(`Auto-cancelling order ${order.id}`);
                            SocketService.emitToRoom(`order_${order.id}`, 'orderStatusUpdated', {
                                orderId: order.id,
                                status: 'cancelled',
                                order: cancelledOrder,
                                message: 'Order cancelled. No couriers found nearby.'
                            });

                            SocketService.emitToRoom(`user_${order.customer_id}`, 'orderStatusUpdated', {
                                orderId: order.id,
                                status: 'cancelled',
                                order: cancelledOrder,
                                message: 'Order cancelled. No couriers found nearby. You will not be charged.'
                            });

                            // In a real system, trigger refund logic here if paid
                        }
                    }
                } finally {
                    client.release();
                }
            } catch (err) {
                console.error('Cron Job Error:', err);
            }
        }, CHECK_INTERVAL_MS);
    }
};
