import 'dotenv/config';
import pool from '../db';

const migrateMerchantStatus = async () => {
    const query = `
        ALTER TABLE merchants 
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected'));
    `;

    try {
        await pool.query(query);
        console.log('✅ Added status column to merchants table');
    } catch (error) {
        console.error('❌ Failed to update merchants table:', error);
    } finally {
        pool.end();
    }
};

migrateMerchantStatus();
