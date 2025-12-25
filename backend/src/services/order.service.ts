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
        items?: any[];
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
          pricing_details, total_amount_ghs, payment_method, notes, items, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'created')
        RETURNING *
      `;

            const values = [
                data.customerId,
                data.pickup.lat, data.pickup.lng, data.pickup.address, data.pickup.phone, data.pickup.landmark,
                data.dropoff.lat, data.dropoff.lng, data.dropoff.address, data.dropoff.phone, data.dropoff.landmark,
                data.pricingDetails, data.totalAmount, data.paymentMethod, data.notes, JSON.stringify(data.items || [])
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
            // REMOVED: Auto-dispatch is now triggered when Merchant accepts the order (status: 'confirmed')
            // const { DispatchService } = require('./dispatch.service');
            // DispatchService.assignOrder(newOrder.id).catch((err: any) => console.error('Auto-dispatch failed:', err));

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

            // TRIGGER DISPATCH IF MERCHANT ACCEPTED
            if (status === 'accepted') {
                const { DispatchService } = require('./dispatch.service');
                // We don't await this to keep response fast, but in prod consider queue
                DispatchService.assignOrder(orderId).catch((err: any) => console.error('Dispatch failed:', err));
            }

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
    },

    async declineOrder(orderId: string, courierId: string) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verify order is assigned to this courier
            // Note: We need to check if courierId matches the order's courier_id
            // Ideally we get the courier primary key (id) from the user_id (courierId arg might be user_id)
            // Let's assume courierId passed here is the USER ID, so we look up the courier profile first.

            const courierRes = await client.query('SELECT id FROM couriers WHERE user_id = $1', [courierId]);
            if (courierRes.rows.length === 0) throw new Error('Courier profile not found');
            const courierProfileId = courierRes.rows[0].id;

            const orderRes = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
            const order = orderRes.rows[0];

            if (!order) throw new Error('Order not found');
            if (order.courier_id !== courierProfileId) {
                throw new Error('Order is not assigned to this courier');
            }

            // Unassign
            const updateRes = await client.query(
                `UPDATE orders SET courier_id = NULL, status = 'accepted', updated_at = NOW() WHERE id = $1 RETURNING *`,
                [orderId]
            );
            const updatedOrder = updateRes.rows[0];

            await client.query('COMMIT');

            // Trigger Re-dispatch (Auto-Assignment)
            // We do this after commit so the order is visible as 'accepted' to the dispatcher
            try {
                // Dynamically import to avoid circular dependency if any (DispatchService -> PricingService -> ...)
                const { DispatchService } = require('./dispatch.service');
                console.log(`Triggering re-dispatch for order ${orderId}, excluding courier ${courierProfileId}`);
                await DispatchService.assignOrder(orderId, [courierProfileId]);
            } catch (dispatchErr) {
                console.log('Re-dispatch failed (likely no other couriers available):', dispatchErr);
                // We do NOT fail the decline request; the order remains 'accepted' for manual assignment
            }

            return updatedOrder;

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
};
