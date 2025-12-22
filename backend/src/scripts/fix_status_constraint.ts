import pool from '../db';

async function updateConstraint() {
    try {
        console.log('Updating orders table status constraint...');

        // First, drop the existing constraint
        await pool.query('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');

        // Add the new constraint with all required statuses
        await pool.query(`
      ALTER TABLE orders 
      ADD CONSTRAINT orders_status_check 
      CHECK (status IN ('created', 'assigned', 'accepted', 'picked_up', 'delivered', 'cancelled', 'pending'))
    `);

        console.log('Constraint updated successfully.');
    } catch (err) {
        console.error('Error updating constraint:', err);
    } finally {
        pool.end();
    }
}

updateConstraint();
