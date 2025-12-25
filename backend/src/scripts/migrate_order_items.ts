import 'dotenv/config';
import pool from '../db';

const migrateOrderItems = async () => {
    const query = `
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS items JSONB;
    `;

    try {
        await pool.query(query);
        console.log('✅ Added items column to orders table');
    } catch (error) {
        console.error('❌ Failed to update orders table:', error);
    } finally {
        pool.end();
    }
};

migrateOrderItems();
