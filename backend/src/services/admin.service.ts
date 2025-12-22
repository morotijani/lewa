import pool from '../db';

export const AdminService = {
    async getDashboardStats() {
        const client = await pool.connect();
        try {
            // Total Orders
            const ordersRes = await client.query('SELECT COUNT(*) FROM orders');
            const totalOrders = parseInt(ordersRes.rows[0].count);

            // Active Couriers
            const couriersRes = await client.query('SELECT COUNT(*) FROM couriers WHERE is_online = true');
            const activeCouriers = parseInt(couriersRes.rows[0].count);

            // Pending Deliveries (anything not delivered or cancelled)
            const pendingRes = await client.query("SELECT COUNT(*) FROM orders WHERE status NOT IN ('delivered', 'cancelled')");
            const pendingDeliveries = parseInt(pendingRes.rows[0].count);

            // Total Revenue (Sum of total_amount_ghs)
            const revenueRes = await client.query('SELECT SUM(total_amount_ghs) FROM orders WHERE status = \'delivered\''); // Only count revenue from delivered orders? Or all created? Let's say delivered for accuracy.
            const totalRevenue = parseFloat(revenueRes.rows[0].sum || '0');

            return {
                totalOrders,
                activeCouriers,
                pendingDeliveries,
                totalRevenue
            };
        } finally {
            client.release();
        }
    },

    async getActiveCouriers() {
        // Fetch online couriers with their user names and locations
        const res = await pool.query(`
            SELECT c.id, c.user_id, c.current_lat, c.current_lng, c.vehicle_type, u.full_name, c.is_online
            FROM couriers c
            JOIN users u ON c.user_id = u.id
            WHERE c.is_online = true
        `);
        return res.rows;
    },

    async getRecentOrders() {
        const res = await pool.query(`
            SELECT o.*, u.full_name as customer_name
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 10
        `);
        return res.rows;
    }
};
