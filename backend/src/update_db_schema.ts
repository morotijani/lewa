
import pool from './db';

async function run() {
    try {
        console.log('Updating orders status check constraint...');
        await pool.query('ALTER TABLE orders DROP CONSTRAINT orders_status_check');
        await pool.query("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('created', 'accepted', 'confirmed', 'ready_for_pickup', 'assigned', 'picked_up', 'delivered', 'cancelled'))");
        console.log('✅ Constraint updated successfully.');
    } catch (err) {
        console.error('❌ Failed to update constraint:', err);
    } finally {
        process.exit(0);
    }
}
run();
