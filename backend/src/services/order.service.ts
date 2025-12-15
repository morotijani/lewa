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
            return result.rows[0];

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

    async getUserOrders(userId: string) {
        const result = await pool.query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC', [userId]);
        return result.rows;
    }
};
