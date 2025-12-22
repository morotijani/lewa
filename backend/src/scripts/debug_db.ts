import pool from '../db';

const checkTables = async () => {
    try {
        console.log('Connecting...');
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables:', res.rows.map(r => r.table_name));
    } catch (err) {
        console.error('DB Error:', err);
    } finally {
        pool.end();
    }
};

checkTables();
