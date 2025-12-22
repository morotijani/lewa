
import pool from '../db';

async function checkCourier() {
    try {
        const res = await pool.query(`
            SELECT c.*, u.full_name, u.is_verified 
            FROM couriers c 
            JOIN users u ON c.user_id = u.id
        `);
        console.log('--- Couriers in DB ---');
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkCourier();
