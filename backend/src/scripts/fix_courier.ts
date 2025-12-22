import pool from '../db';

async function fixCouriers() {
    try {
        console.log('Checking for users with role "courier" but no profile...');

        const res = await pool.query(`
      INSERT INTO couriers (user_id, vehicle_type, license_plate)
      SELECT id, 'motorcycle', 'TEST-PLATE'
      FROM users 
      WHERE role = 'courier' 
      AND id NOT IN (SELECT user_id FROM couriers)
      RETURNING *;
    `);

        console.log(`Created ${res.rowCount} missing courier profiles.`);
    } catch (err) {
        console.error('Error fixing couriers:', err);
    } finally {
        pool.end();
    }
}

fixCouriers();
