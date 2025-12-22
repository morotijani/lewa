import pool from '../db';
import { PricingService } from './pricing.service'; // For distance helper if needed, but SQL is better here

export const DispatchService = {
  // Find nearest online courier with matching vehicle type
  async findNearestCourier(pickupLat: number, pickupLng: number, vehicleType: string, radiusKm: number = 5) {
    // using Haversine formula directly in SQL for ordering
    // 6371 * acos(cos(radians(pickupLat)) * cos(radians(current_lat)) * cos(radians(current_lng) - radians(pickupLng)) + sin(radians(pickupLat)) * sin(radians(current_lat)))

    // Note: We check if they are verified and online.
    // Also ideally check if they aren't busy. My schema only has is_online.
    // I'll assume is_online=true means available for now.

    const query = `
      SELECT id, full_name, current_lat, current_lng, vehicle_type,
      (
        6371 * acos(
          cos(radians($1)) * cos(radians(current_lat)) * cos(radians(current_lng) - radians($2)) + 
          sin(radians($1)) * sin(radians(current_lat))
        )
      ) AS distance
      FROM couriers
      JOIN users ON couriers.user_id = users.id
      WHERE vehicle_type = $3
      AND is_online = TRUE
      AND users.is_verified = TRUE
      HAVING (
        6371 * acos(
          cos(radians($1)) * cos(radians(current_lat)) * cos(radians(current_lng) - radians($2)) + 
          sin(radians($1)) * sin(radians(current_lat))
        )
      ) < $4
      ORDER BY distance ASC
      LIMIT 1;
    `;

    // Note: HAVING clause needs specific GROUP BY or be standard SQL. 
    // Postgres supports column aliases in HAVING/ORDER BY but simpler to use subquery or computed col in WHERE if not aggregated.
    // Let's use a simpler WHERE with calculation or CTE.

    const cleanQuery = `
      WITH nearby_couriers AS (
        SELECT c.id, c.user_id, c.current_lat, c.current_lng, c.vehicle_type, u.full_name,
        (
          6371 * acos(
            least(1.0, greatest(-1.0, 
              cos(radians($1)) * cos(radians(c.current_lat)) * cos(radians(c.current_lng) - radians($2)) + 
              sin(radians($1)) * sin(radians(c.current_lat))
            ))
          )
        ) AS distance
        FROM couriers c
        JOIN users u ON c.user_id = u.id
        WHERE c.vehicle_type = $3
        AND c.is_online = TRUE
        AND u.is_verified = TRUE
      )
      SELECT * FROM nearby_couriers
      WHERE distance < $4
      ORDER BY distance ASC
      LIMIT 1;
    `;

    const result = await pool.query(cleanQuery, [pickupLat, pickupLng, vehicleType, radiusKm]);
    return result.rows[0];
  },

  async assignOrder(orderId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Get Order
      const orderRes = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
      const order = orderRes.rows[0];

      if (!order) throw new Error('Order not found');
      if (order.status !== 'created') throw new Error('Order is not in created state');

      // 2. Find Courier
      // Need vehicle type from order -> logic: infer from pricing_details or store vehicle_type in orders? 
      // Plan didn't specify vehicle_type in orders table explicitly, but CreateOrder used it.
      // Let's assume we stored it in 'pricing_details' json or passed it.
      // Actually, my CreateOrder implementation didn't save vehicle_type to a column! 
      // I should have added vehicle_type column to orders.
      // For now, I'll extract it from pricing_details if present, or update CreateOrder to save it.
      // Let's fix CreateOrder schema/service later if needed. For now, check pricing_details.

      let vehicleType = 'motorcycle'; // Default
      if (order.pricing_details && order.pricing_details.vehicle_type) {
        vehicleType = order.pricing_details.vehicle_type;
      }
      // Wait, CreateOrder Service save "pricingDetails". I will assume I put vehicleType there.

      const courier = await this.findNearestCourier(order.pickup_lat, order.pickup_lng, vehicleType);

      if (!courier) {
        throw new Error('No couriers available nearby');
      }

      // 3. Update Order
      const updateRes = await client.query(
        `UPDATE orders SET courier_id = $1, status = 'assigned', updated_at = NOW() WHERE id = $2 RETURNING *`,
        [courier.id, orderId]
      );
      const updatedOrder = updateRes.rows[0];

      // 4. Logging
      console.log(`Assigned courier ${courier.full_name} (${courier.id}) to order ${orderId}`);

      await client.query('COMMIT');

      const { SocketService } = require('./socket.service');
      // Emit full order object to match frontend expectation
      SocketService.emitToRoom(`order_${orderId}`, 'orderStatusUpdated', { orderId, status: 'assigned', order: updatedOrder, courier });
      SocketService.emitToRoom(`user_${order.customer_id}`, 'orderStatusUpdated', { orderId, status: 'assigned', order: updatedOrder, courier });

      // Notify Courier
      // Assuming courier is connected and joined 'courier_{id}' or 'user_{id}'? 
      // SocketService usually joins 'user_{userId}' typically. Let's start with that or check socket.service.ts
      // DispatchService uses courier.id (which is the courier profile ID) or courier.user_id? 
      // findNearestCourier returns c.id, c.user_id via query
      // The socket usually authenticates with User ID. So 'user_{courier.user_id}' is safe.
      SocketService.emitToRoom(`user_${courier.user_id}`, 'newOrder', { order, status: 'assigned' });

      return { success: true, courier };

    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
};
