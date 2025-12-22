import pool from '../db';

async function listData() {
    try {
        const users = await pool.query('SELECT id, full_name, role, phone_number FROM users');
        console.log('USERS:', users.rows);

        const couriers = await pool.query('SELECT id, user_id, vehicle_type, is_online FROM couriers');
        console.log('COURIERS:', couriers.rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

listData();
