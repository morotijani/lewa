import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root (one level up from src/scripts)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function seed() {
    try {
        const phone = '0245550123';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);
        const fullName = 'Demo User';

        // Check if user exists
        const res = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phone]);
        if (res.rows.length > 0) {
            console.log('User already exists');
            console.log('Phone:', phone);
            console.log('Password:', password);
            return;
        }

        // Insert user
        await pool.query(
            'INSERT INTO users (full_name, phone_number, password_hash, role) VALUES ($1, $2, $3, $4)',
            [fullName, phone, hashedPassword, 'customer']
        );

        console.log('Seed successful');
        console.log('Phone:', phone);
        console.log('Password:', password);
    } catch (err) {
        console.error('Seed failed', err);
    } finally {
        pool.end();
    }
}

seed();
