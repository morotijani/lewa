import pool from '../db';

export const CourierService = {
    // Update online status and location
    async updateStatus(userId: string, isOnline: boolean, lat?: number, lng?: number) {
        // First get courier_id from user_id
        const courierRes = await pool.query('SELECT id FROM couriers WHERE user_id = $1', [userId]);
        const courier = courierRes.rows[0];

        if (!courier) {
            throw new Error('Courier profile not found for this user');
        }

        // Dynamic update query
        let query = 'UPDATE couriers SET is_online = $1, last_location_update = NOW()';
        const params: any[] = [isOnline];
        let paramIdx = 2;

        if (lat !== undefined && lng !== undefined) {
            query += `, current_lat = $${paramIdx++}, current_lng = $${paramIdx++}`;
            params.push(lat, lng);
        }

        query += ` WHERE id = $${paramIdx} RETURNING *`;
        params.push(courier.id);

        const result = await pool.query(query, params);
        return result.rows[0];
    },

    // Get courier profile
    async getProfile(userId: string) {
        const result = await pool.query(`
      SELECT c.*, u.full_name, u.phone_number, u.email 
      FROM couriers c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = $1
    `, [userId]);
        return result.rows[0];
    },

    // Create courier profile (if not exists) - usually done at registration or separate onboarding
    async createProfile(userId: string, vehicleType: string, licensePlate: string) {
        const result = await pool.query(`
      INSERT INTO couriers (user_id, vehicle_type, license_plate)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [userId, vehicleType, licensePlate]);
        return result.rows[0];
    },

    // Update courier profile
    async updateProfile(userId: string, vehicleType: string, licensePlate: string) {
        const result = await pool.query(`
      UPDATE couriers 
      SET vehicle_type = $2, license_plate = $3
      WHERE user_id = $1
      RETURNING *
    `, [userId, vehicleType, licensePlate]);

        if (result.rowCount === 0) {
            throw new Error('Courier profile not found');
        }
        return result.rows[0];
    }
};
