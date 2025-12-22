import pool from '../db';

async function checkCourierStatus() {
    try {
        const res = await pool.query(`
      SELECT 
        u.id as user_id, 
        u.full_name, 
        u.is_verified, 
        u.role,
        c.id as courier_id, 
        c.is_online, 
        c.vehicle_type, 
        c.current_lat, 
        c.current_lng
      FROM users u
      LEFT JOIN couriers c ON u.id = c.user_id
      WHERE u.role = 'courier'
    `);

        console.log('Couriers Status:', JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkCourierStatus();
