
import pool from './db';

async function run() {
    const res = await pool.query('SELECT id FROM users LIMIT 1');
    console.log('USER_ID:', res.rows[0].id);
    process.exit(0);
}
run();
