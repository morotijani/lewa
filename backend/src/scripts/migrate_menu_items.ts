import 'dotenv/config';
import pool from '../db';

const createMenuItemsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS menu_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            category VARCHAR(50),
            is_available BOOLEAN DEFAULT TRUE,
            image_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(query);
        console.log('✅ menu_items table created successfully');
    } catch (error) {
        console.error('❌ Failed to create menu_items table:', error);
    } finally {
        pool.end();
    }
};

createMenuItemsTable();
