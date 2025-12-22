import pool from '../db';

async function verifyCouriers() {
    try {
        console.log('Verifying all couriers...');
        const res = await pool.query("UPDATE users SET is_verified = true WHERE role = 'courier'");
        console.log(`Updated ${res.rowCount} couriers to Verified status.`);
    } catch (err) {
        console.error('Error verifying couriers:', err);
    } finally {
        pool.end();
    }
}

verifyCouriers();
