import 'dotenv/config';
import pool from '../db';

const seedMenu = async () => {
    // 1. Get Merchant ID
    const merchRes = await pool.query(`
        SELECT m.id 
        FROM merchants m 
        JOIN users u ON m.user_id = u.id 
        WHERE u.email = 'merchant@lewa.com'
    `);
    const merchantId = merchRes.rows[0]?.id;

    if (!merchantId) {
        console.error('Merchant not found! Run create_merchant.ts first.');
        return;
    }

    console.log('Seeding for Merchant ID:', merchantId);

    // 2. Insert Items
    const items = [
        { name: 'Jollof Rice & Chicken', price: 45.00, category: 'Main', description: 'Spicy jollof with grilled chicken' },
        { name: 'Fried Rice & Beef', price: 50.00, category: 'Main', description: 'Wok fried rice with tender beef chunks' },
        { name: 'Banku & Tilapia', price: 60.00, category: 'Main', description: 'Fresh Tilapia with hot pepper' },
        { name: 'Coca Cola', price: 10.00, category: 'Drinks', description: 'Chilled 500ml bottle' },
        { name: 'Kelewele', price: 15.00, category: 'Sides', description: 'Spicy fried plantain cubes' }
    ];

    for (const item of items) {
        await pool.query(`
            INSERT INTO menu_items (merchant_id, name, price, category, description)
            VALUES ($1, $2, $3, $4, $5)
        `, [merchantId, item.name, item.price, item.category, item.description]);
    }

    console.log('✅ Menu seeded with 5 items.');
    pool.end();
};

seedMenu();
