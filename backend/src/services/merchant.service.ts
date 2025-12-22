import pool from '../db';

export const MerchantService = {
    // --- Menu Management ---

    async getMenu(merchantId: string) {
        const res = await pool.query(
            'SELECT * FROM menu_items WHERE merchant_id = $1 ORDER BY category, name',
            [merchantId]
        );
        return res.rows;
    },

    async addMenuItem(merchantId: string, data: { name: string, price: number, category: string, description?: string }) {
        const res = await pool.query(
            `INSERT INTO menu_items (merchant_id, name, price, category, description)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [merchantId, data.name, data.price, data.category, data.description]
        );
        return res.rows[0];
    },

    async updateMenuItem(itemId: string, data: { name?: string, price?: number, category?: string, description?: string, isAvailable?: boolean }) {
        let query = 'UPDATE menu_items SET updated_at = NOW()';
        const params: any[] = [];
        let paramIdx = 1;

        if (data.name !== undefined) {
            query += `, name = $${paramIdx++}`;
            params.push(data.name);
        }
        if (data.price !== undefined) {
            query += `, price = $${paramIdx++}`;
            params.push(data.price);
        }
        if (data.category !== undefined) {
            query += `, category = $${paramIdx++}`;
            params.push(data.category);
        }
        if (data.description !== undefined) {
            query += `, description = $${paramIdx++}`;
            params.push(data.description);
        }
        if (data.isAvailable !== undefined) {
            query += `, is_available = $${paramIdx++}`;
            params.push(data.isAvailable);
        }

        query += ` WHERE id = $${paramIdx} RETURNING *`;
        params.push(itemId);

        const res = await pool.query(query, params);
        return res.rows[0];
    },

    async deleteMenuItem(itemId: string) {
        await pool.query('DELETE FROM menu_items WHERE id = $1', [itemId]);
        return { success: true };
    },

    // --- Order Management ---

    // For Demo: Fetch ALL orders that are seemingly for a restaurant (not P2P) or just latest orders
    // Ideally we filter by merchant_id, but for MVP we will return latest 20 orders
    async getMerchantOrders(merchantId: string) {
        // If we had merchant_id on orders:
        // 'SELECT * FROM orders WHERE merchant_id = $1 ...'
        // For now, let's just return recent orders so the dashboard looks alive
        const res = await pool.query(`
            SELECT o.*, u.full_name as customer_name,
            -- Mock items for now since we store details in JSON or unrelated table?
            -- Actually we should store items in a order_items table or JSONB
            -- Let's return the whole order object
            o.notes
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 20
        `);
        return res.rows;
    }
};
