import pool from '../db';

export const OrderService = {
    async createOrder(data: {
        customerId: string;
        pickup: { lat: number; lng: number; address: string; phone: string; landmark?: string };
        dropoff: { lat: number; lng: number; address: string; phone: string; landmark?: string };
        vehicleType: string;
        pricingDetails: any;
        totalAmount: number;
        paymentMethod: string;
        notes?: string;
    }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

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

            const result = await client.query(queryText, values);
            await client.query('COMMIT');

            const newOrder = result.rows[0];

            // Emit event
            // dynamically import to avoid circular dep if needed, or just import at top if safe
            // For now, let's assume methods are static and safe
            const { SocketService } = require('./socket.service'); // Using require to avoid potential circular dep issues during init
            SocketService.emitToRoom(`user_${data.customerId}`, 'orderCreated', newOrder);

            // Trigger Dispatch asynchronously
            // We don't await this so the ID is returned to user immediately
            // But in a real app better to await or use queue
            const { DispatchService } = require('./dispatch.service');
            DispatchService.assignOrder(newOrder.id).catch((err: any) => console.error('Auto-dispatch failed:', err));

            return newOrder;

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    async getOrderById(orderId: string) {
        const result = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
        return result.rows[0];
    },

    async updateStatus(orderId: string, status: string, userId: string) {
        // Validate transition? (e.g. created -> assigned -> accepted -> picked_up -> delivered)
        // For MVP, just update.
        // userId used for validation (is this the courier assigned?)

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(
                'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
                [status, orderId]
            );

            if (result.rowCount === 0) throw new Error('Order not found');
            const updatedOrder = result.rows[0];

            await client.query('COMMIT');

            // Emit update
            const { SocketService } = require('./socket.service');
            SocketService.emitToRoom(`order_${orderId}`, 'orderStatusUpdated', { orderId, status, order: updatedOrder });
            SocketService.emitToRoom(`user_${updatedOrder.customer_id}`, 'orderStatusUpdated', { orderId, status, order: updatedOrder });

            return updatedOrder;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    async getUserOrders(userId: string) {
        const result = await pool.query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC', [userId]);
        return result.rows;
    }
};
