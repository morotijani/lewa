import 'dotenv/config';
import pool from '../db';

const getMerchantId = async () => {
    try {
        const res = await pool.query(`
            SELECT m.id 
            FROM merchants m 
            JOIN users u ON m.user_id = u.id 
            WHERE u.email = 'merchant@lewa.com'
        `);
        console.log('MERCHANT_ID:', res.rows[0]?.id || 'Not Found');
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
};

getMerchantId();
