import 'dotenv/config';
import pool from '../db';

const createDemoMerchant = async () => {
    // Check if demo user exists
    let userRes = await pool.query("SELECT id FROM users WHERE email = 'merchant@lewa.com'");
    if (userRes.rows.length === 0) {
        userRes = await pool.query(`
            INSERT INTO users (phone_number, email, full_name, role)
            VALUES ('0200000001', 'merchant@lewa.com', 'Mama Tess', 'merchant')
            RETURNING id
        `);
    }
    const userId = userRes.rows[0].id;

    // Check if merchant exists
    let merchRes = await pool.query("SELECT id FROM merchants WHERE user_id = $1", [userId]);
    if (merchRes.rows.length === 0) {
        merchRes = await pool.query(`
            INSERT INTO merchants (user_id, business_name, address_text)
            VALUES ($1, 'Mama Tess Kitchen', 'Osu, Accra')
            RETURNING id
        `, [userId]);
    }

    console.log('DEMO_MERCHANT_ID:', merchRes.rows[0].id);
    pool.end();
};

createDemoMerchant();
