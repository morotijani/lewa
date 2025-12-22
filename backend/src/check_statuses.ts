
import pool from './db';

async function run() {
    try {
        const res = await pool.query('SELECT DISTINCT status FROM orders');
        console.log('Existing statuses:', res.rows.map(r => r.status));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
run();
