import pool from '../db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

export const AuthService = {
    // Simulates sending an OTP (just returns hardcoded 1234 for dev)
    async sendOtp(phoneNumber: string) {
        // In production, integrate with SMS provider (e.g., Twilio, Arkesel)
        console.log(`Sending OTP to ${phoneNumber}`);
        return { success: true, otp: '1234' };
    },

    // Register or Login with Phone Number + OTP (Mocked for now as "Password" flow to simplicity or direct create)
    // For this phase, let's implement a direct Register and Login flow to establish users.

    async register(phone: string, email: string, fullName: string, role: string = 'customer', password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const result = await pool.query(
                `INSERT INTO users (phone_number, email, full_name, role, password_hash) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, full_name, role, phone_number`,
                [phone, email, fullName, role, hashedPassword]
            );
            return result.rows[0];
        } catch (err: any) {
            if (err.code === '23505') { // Unique violation
                throw new Error('User already exists');
            }
            throw err;
        }
    },

    async login(phone: string, password: string) {
        const result = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phone]);
        const user = result.rows[0];

        if (!user) throw new Error('Invalid credentials');

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) throw new Error('Invalid credentials');

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        return {
            user: { id: user.id, name: user.full_name, role: user.role },
            token
        };
    }
};
