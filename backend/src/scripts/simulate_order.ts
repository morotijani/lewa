import pool from '../db';
import { OrderService } from '../services/order.service';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    try {
        console.log('Connecting...');

        // 1. Create a dummy customer
        const customerPhone = '020' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
        const res = await pool.query(
            `INSERT INTO users (full_name, phone_number, password_hash, role)
             VALUES ('Test Customer', $1, 'hash', 'customer') RETURNING id`,
            [customerPhone]
        );
        const customerId = res.rows[0].id;
        console.log('Created Test Customer:', customerId);

        // 2. Create Order near Legon (Courier is at 5.6508, -0.1870)
        // Let's pickup at 5.6500, -0.1860 (very close)
        const orderData = {
            customerId,
            pickup: {
                lat: 5.6500,
                lng: -0.1870, // Same longitude, slightly south
                address: 'University of Ghana Main Gate',
                phone: customerPhone
            },
            dropoff: {
                lat: 5.6037, // Accra
                lng: -0.1870,
                address: 'Accra Mall',
                phone: '0555555555'
            },
            vehicleType: 'motorcycle',
            pricingDetails: { base: 15, distance: 3.5 },
            totalAmount: 20.00,
            paymentMethod: 'cash',
            notes: 'Simulated Order from Script'
        };

        console.log('Creating Order...');
        const order = await OrderService.createOrder(orderData);
        console.log('Order Created ID:', order.id);
        console.log('Waiting for Auto-Dispatch...');

    } catch (e) {
        console.error(e);
    } finally {
        // Keep alive for 5 seconds to allow async Dispatch to complete
        setTimeout(() => {
            console.log('Done.');
            pool.end();
        }, 5000);
    }
}
run();
